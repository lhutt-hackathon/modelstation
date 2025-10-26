"""Training orchestration utilities."""

from __future__ import annotations

import os
from typing import TYPE_CHECKING, Tuple

if TYPE_CHECKING:
    from unsloth import FastModel
    from transformers import PreTrainedTokenizerBase

from .cli import TrainingSettings
from .data import (
    build_chatml_converter,
    build_formatting_fn,
    load_training_dataset,
)


def train_model(settings: TrainingSettings) -> Tuple["FastModel", "PreTrainedTokenizerBase"]:
    from unsloth import FastModel
    from unsloth.chat_templates import get_chat_template
    from trl import SFTConfig, SFTTrainer

    os.environ.setdefault("TORCHDYNAMO_DISABLE", "1")
    os.environ.setdefault("UNSLOTH_COMPILE_DISABLE", "1")

    model, tokenizer = FastModel.from_pretrained(
        model_name=settings.model_name,
        max_seq_length=settings.max_seq_length,
        load_in_4bit=False,
        load_in_8bit=False,
        full_finetuning=False,
    )

    model = FastModel.get_peft_model(
        model,
        r=128,
        target_modules=[
            "q_proj",
            "k_proj",
            "v_proj",
            "o_proj",
            "gate_proj",
            "up_proj",
            "down_proj",
        ],
        lora_alpha=128,
        lora_dropout=0,
        bias="none",
        use_gradient_checkpointing="unsloth",
        random_state=3407,
        use_rslora=False,
        loftq_config=None,
    )

    tokenizer = get_chat_template(tokenizer, chat_template=settings.chat_template)

    dataset = load_training_dataset(
        settings.dataset,
        settings.split,
        settings.dataset_format,
        settings.dataset_field,
        settings.dataset_config,
    )
    dataset = dataset.map(
        build_chatml_converter(
            system_column=settings.system_column or None,
            user_column=settings.user_column,
            assistant_column=settings.assistant_column,
        )
    )
    dataset = dataset.map(
        build_formatting_fn(tokenizer),
        batched=True,
    )

    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=dataset,
        eval_dataset=None,
        args=SFTConfig(
            dataset_text_field="text",
            warmup_steps=5,
            max_steps=settings.max_steps,
            learning_rate=settings.learning_rate,
            logging_steps=1,
            optim="adamw_8bit",
            weight_decay=0.01,
            lr_scheduler_type="linear",
            seed=3407,
            output_dir=settings.output_dir,
            report_to="none",
        ),
    )

    trainer.train(resume_from_checkpoint=settings.resume_from_checkpoint)

    return model, tokenizer
