# 🛡️ AI Benchmark: Laravel Package Generation

This repository documents a benchmark of various LLMs (Large Language Models) tasked with creating a fully functional Laravel Package (`RequestShield`) from scratch.

The goal was to test the capabilities of proprietary models (Claude) against current Open Source models regarding **modern PHP 8.2+ features**, **Laravel Architecture**, **Logic Implementation**, and **Resource Efficiency**.

## 📋 The Prompt

Each model received the exact same prompt. You can read the full prompt here: [prompt.md](prompt.md).

> **Task Summary:** Create a Laravel Package named `VendorName/RequestShield` including Middleware (Block Bots/IPs), ServiceProvider, Facade, Config, and Artisan Stats Command using PHP 8.2+ features.

---

## 💰 Resources & Efficiency (The "Hidden Cost")

A critical finding of this benchmark is the resource consumption (tokens/cost/compute).

*   **Proprietary Models (Claude Opus & Sonnet):**
    These two models alone consumed approximately **22%** of the available usage limit for their generations.
*   **Open Source / Ollama Models (All other 6 combined):**
    Combined, they consumed only **2.6%** of the usage limit.

> **Insight:** While the high-end Anthropic models deliver superior quality, they are **approx. 25x more expensive/resource-intensive** than the efficient Open Source alternatives.

---

## 🏎️ Performance (Generation Time)

Time measures the duration from sending the prompt to the completion of all file generation.

| Rank | Model | Time | Type | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| ⚡ | **Devstral 2** | `12.3s` | Open Source | *Too fast* (Incomplete code) |
| 🥈 | **DeepSeek v3.1** | `22.1s` | Open Source | **Highly Efficient** |
| 🥇 | **Claude Opus 4.6** | `54.6s` | Proprietary | **Sweet Spot** (Fast & Complete) |
| 4. | **Claude Sonnet 4.5** | `1m 53s` | Proprietary | Good |
| 5. | **MiniMax 2.5** | `3m 43s` | Open Source | Acceptable |
| 6. | **Qwen Coder** | `5m 48s` | Open Source | Slow |
| 7. | **GLM-5** | `6m 36s` | Open Source | Very Slow |
| 8. | **Kimi k2.5** | `8m 15s` | Open Source | Extremely Slow |

---

## 📊 Scorecard: Code Quality & Features

Technical implementation rating (Scale 1-5).

| Criterion | Claude Opus | Kimi k2.5 | GLM-5 | Sonnet 4.5 | Qwen Coder | MiniMax | DeepSeek |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **PHP 8.2+ Features** | 5 | 5 | 5 | 5 | 4 | 4 | 5 |
| **Laravel Best Practices** | 5 | **5+** | 4 | 5 | 4 | 3 | 4 |
| **Logic (CIDR/Regex)** | **5** | 5 | **5+** | 4 | 3 | 3 | 3 |
| **Completeness** | 5 | 5 | 5 | 5 | 3 | 4 | 3 |
| **Architecture** | Clean | Enterprise | Complex | Clean | Basic | Basic | Minimal |
| **OVERALL** | **🏆** | **🥈** | **🥉** | **Top** | **Mid** | **Mid** | **Fast** |

---

## 🔍 Detailed Candidate Analysis

### 👑 Claude Opus 4.6
*   **Pro:** Consistently uses `readonly classes` and `strict_types`.
*   **Highlight:** The IP check uses real Bitwise Operators (`<<`, `&`) for CIDR ranges. This is the most performant and correct way to check IP ranges.
*   **Stats:** Uses Laravel Cache intelligently with TTL.

### 🤖 Claude Sonnet 4.5
*   **Pro:** Clean implementation, no hallucinations.
*   **Highlight:** Generated the best-looking default Blade view with modern CSS gradients.
*   **Contra:** Costs almost as much as Opus but took twice as long.

### 🏛️ Kimi k2.5
*   **Pro:** Uses `Contracts` (`ShieldInterface`) and custom `Exceptions` for maximum decoupling.
*   **Highlight:** Built a **CSS-animated "Shield" graphic** into the Blade view. Impressive attention to detail.
*   **Contra:** Severely "Over-Engineered" for a small middleware package and extremely slow (8 mins).

### 🛠️ GLM-5
*   **Pro:** Built a custom driver system (File vs. Memory) for statistics to survive cache flushes.
*   **Highlight:** Supports Regex patterns for User-Agents and Whitelisting (even though not explicitly requested).
*   **Contra:** Very slow generation time.

### ⚡ DeepSeek v3.1
*   **Pro:** Incredibly fast and resource-efficient. The code is valid PHP and functional.
*   **Contra:** Logic is very minimalistic (no complex CIDR checks, simple string matches).

### 🐛 MiniMax 2.5
*   **Pro:** Solid logic implementation. The **Bitwise Math** for CIDR checks and the Regex conversion for Wildcards (`*`) are implemented correctly and efficiently.
*   **Highlight:** **Defensive Coding:** It was the **only model** to wrap Cache operations in a `try-catch` block, ensuring the application doesn't crash if the cache driver (e.g., Redis) fails.
*   **Contra:** Invalid `composer.json` type (`"type": "laravel-package"` instead of `library`) and hardcoded view paths (`request-shield::blocked`) which limits customization flexibility.

### ⚠️ Qwen Coder & Devstral
*   **Qwen:** Took the prompt "Mock statistics" too literally and used `rand(10, 100)` in the command. Technically followed the prompt, but practically useless.
*   **Devstral:** Extremely fast, but methods returned hardcoded `0` (Skeleton code).

---

## 🏆 Conclusion & Winners

Due to the massive differences in cost and performance, we have split the results:

### 🥇 Overall Winner (Quality): **Claude Opus 4.6**
When the result must be **"Production-Ready" immediately**.
*   **Why:** Perfect understanding of Laravel architecture, correct implementation of complex logic (CIDR), and error-free code.
*   **Trade-off:** High resource consumption.

### 🥈 Open Source Winner (Efficiency): **DeepSeek v3.1**
The price-performance winner for rapid prototyping.
*   **Why:** Generated valid PHP in just **22 seconds**. Ideal for local development via Ollama as it consumes almost no resources compared to proprietary models.

### 🥉 Open Source Winner (Features): **GLM-5**
When time is irrelevant, but budget (API costs) is tight.
*   **Why:** Delivered the most feature-rich package of all Open Source models.

### 🏅 Architecture Mention: **Kimi k2.5**
For inspiration on complex structures.
*   **Why:** Demonstrates how to write clean interfaces and decoupled code, even if it was overkill for this specific task.

---

*Benchmark Date: February 2026*