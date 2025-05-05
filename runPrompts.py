import os
import pandas as pd
import requests
import json
import time

# Load CSV files
df1 = pd.read_csv('text_reports.csv')
df2 = pd.read_csv('voice_reports.csv')

# Combine dataframes
df = pd.concat([df1, df2], ignore_index=True)

# === User-provided variables ===
prompt_index = 6
model_name = "Qwen2.5_instruct_14B"

# Prompt using Mistral Instruct style
prompt = "### Instruction:\nJe taak is om een klinische abstractie te maken van de onderstaande rapportage. Let op: je mag intern redeneren, maar in je output mag alleen de uiteindelijke abstractie verschijnen — géén tussenstappen, géén uitleg, géén interne gedachten.\n\nVolg deze richtlijnen bij het maken van de abstractie:\n\n1. Voeg geen nieuwe informatie toe en trek geen conclusies die niet letterlijk in de rapportage staan.\n2. Behoud alle belangrijke elementen, zoals:\n   - observaties\n   - benoemde emoties\n   - klachten (fysiek of mentaal)\n   - reacties op omgeving of begeleiding\n   - uitgesproken voorkeuren of behoeftes\n3. Noem alle uitgevoerde acties en gemaakte afspraken expliciet.\n4. Neem oorzaak-gevolgrelaties op zoals die in de tekst benoemd worden.\n5. Zorg voor correct en verzorgd Nederlands in de abstractie.\n6. Sluit je output af met exact de volgende woorden: <|END_ABSTRACTIE|>\n\n### Input:"

# Output directory
output_dir = "./analysis_responses"
os.makedirs(output_dir, exist_ok=True)

# Correct endpoint
url = "https://s0crnzojxa66vr-8000.proxy.runpod.net/v1/completions"

for idx, row in df.iterrows():
    report = row['Report']
    full_prompt = prompt + report + "\n\n### Output:\n<|ABSTRACTIE_START|>\n"

    payload = {
        "prompt": full_prompt,
        "temperature": 0.3,
        "top_p": 1,
        "top_k": 1,
        "max_tokens": 2048,
        "stop": ["<|END_ABSTRACTIE|>"]
    }

    try:
        start_time = time.time()
        response = requests.post(url, json=payload)
        duration = time.time() - start_time
        response.raise_for_status()
        result = response.json()

        # Token counts
        prompt_n = result.get("usage", {}).get("prompt_tokens", 0)
        predicted_n = result.get("usage", {}).get("completion_tokens", 0)

        # Timing estimates — proportionally split (approximation)
        # Assume prompt processing takes ~10% of time, generation ~90%
        prompt_time = duration * 0.1
        predicted_time = duration * 0.9

        timings = {
            "prompt_n": prompt_n,
            "prompt_ms": round(prompt_time * 1000, 3),
            "prompt_per_token_ms": round((prompt_time * 1000) / prompt_n, 9) if prompt_n else None,
            "prompt_per_second": round(prompt_n / prompt_time, 9) if prompt_time else None,
            "predicted_n": predicted_n,
            "predicted_ms": round(predicted_time * 1000, 3),
            "predicted_per_token_ms": round((predicted_time * 1000) / predicted_n, 9) if predicted_n else None,
            "predicted_per_second": round(predicted_n / predicted_time, 9) if predicted_time else None
        }

        result["timings"] = timings

    except Exception as e:
        result = {
            "error": str(e),
            "timings": {
                "prompt_n": None,
                "prompt_ms": None,
                "prompt_per_token_ms": None,
                "prompt_per_second": None,
                "predicted_n": None,
                "predicted_ms": None,
                "predicted_per_token_ms": None,
                "predicted_per_second": None
            }
        }

    filename = f"row_{idx}-{model_name}-prompt_{prompt_index}.json"
    filepath = os.path.join(output_dir, filename)

    with open(filepath, 'w') as f:
        json.dump(result, f, indent=2)

    print(f"Saved: {filename}")
