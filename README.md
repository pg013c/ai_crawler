# ai_crawler

scripts dedicated to scrape website and use AI to handle it's content

## 1. Setup

to install this project, you need to have Docker installed on your machine. Then type 

```bash
docker compose run --rm yarn install
```

## 2. Configuration

### 2.1. Gemini

to run this project, you need to also have Gemini API key, which you can get from here:

https://aistudio.google.com/apikey

once you have an API key, paste it in .env file. Copy it from .env.dist

### 2.2. Other websites

to run some examples, you will need accounts on a specific websites. You will see a notice about that

## 3. Examples

### 3.1. Scrap Navelo website step by step, with analysing statistics by AI

Notice: here you need to have a free user account on Navelo.pl and fill credentials in .env file

```bash
docker compose run --rm yarn execute dist/ai_scrap_tools.js
```

### 3.2. Scrap website by AI, using injected tools

Notice: here you need to have a free user account on Navelo.pl and fill credentials in .env file

```bash
docker compose run --rm yarn execute dist/step_by_step.js
```

### 3.3. Scrap DNA by AI and look for open job positions

```bash
docker compose run --rm yarn execute dist/check_DNA_job_offers.js
```

### 3.4. Scrap AI_devs and summarize informations

```bash
docker compose run --rm yarn execute dist/summarize_ai_devs.js
```