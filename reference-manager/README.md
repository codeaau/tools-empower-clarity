# Reference Manager CLI

A lightweight, extensible command‑line tool for managing references (books, articles, papers, etc.).  
Built with **Python**, **Click**, and a modular architecture (Repository + Service + CLI).  

This project follows the **CLARITY** principle: transparent design, predictable behavior, and user‑friendly interaction.

---

## ✨ Features

- Add, list, get, update, and delete references
- Search references by keyword (title, authors, notes)
- Import/export references to JSON files
- Modular backend design (JSON by default, PostgreSQL supported, extensible to others)
- Interactive setup: prompts for missing configuration and persists answers into `.env`
- Tested with `pytest`

---

## 📦 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/<your-username>/reference-manager.git
cd reference-manager
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
