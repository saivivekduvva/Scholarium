import os
from pymongo import MongoClient
from datetime import datetime, timedelta

def generate_usage_report():
    uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/scholarium_logs')
    client = MongoClient(uri)
    db = client['scholarium_logs']
    
    report = "# Scholarium AI Usage & API Audit\n\n"
    
    # 1. Historical Usage (Estimated from Cache)
    cache = list(db['llm_cache'].find())
    total_calls = len(cache)
    
    # Simple estimation: 1 word ~ 1.3 tokens
    est_input_tokens = 0
    est_output_tokens = 0
    
    for doc in cache:
        est_input_tokens += len(doc.get('system', '').split()) * 1.3
        est_input_tokens += len(doc.get('user', '').split()) * 1.3
        est_output_tokens += len(doc.get('response', '').split()) * 1.3
        
    report += "## 📈 Historical Summary (Estimated)\n"
    report += f"- **Total LLM Calls:** {total_calls}\n"
    report += f"- **Estimated Total Input Tokens:** {int(est_input_tokens):,}\n"
    report += f"- **Estimated Total Output Tokens:** {int(est_output_tokens):,}\n"
    report += f"- **Estimated Total Tokens:** {int(est_input_tokens + est_output_tokens):,}\n\n"
    
    # 2. Live Telemetry (New System)
    telemetry = list(db['llm_telemetry'].find())
    if telemetry:
        actual_input = sum(d.get('input_tokens', 0) for d in telemetry)
        actual_output = sum(d.get('output_tokens', 0) for d in telemetry)
        report += "## ⚡ Live Telemetry (Actual Counts)\n"
        report += f"- **Recent API Calls Logged:** {len(telemetry)}\n"
        report += f"- **Actual Input Tokens:** {actual_input:,}\n"
        report += f"- **Actual Output Tokens:** {actual_output:,}\n"
        report += f"- **Actual Total Tokens:** {actual_input + actual_output:,}\n\n"
    
    # 3. API Call Distribution
    # We can infer intent from strings in the cache
    intents = {
        'Roadmap Generation': 0,
        'Curriculum Expansion': 0,
        'Quiz Evaluation': 0,
        'Other': 0
    }
    
    for doc in cache:
        prompt = (doc.get('system', '') + doc.get('user', '')).lower()
        if 'roadmap' in prompt or 'graph' in prompt: intents['Roadmap Generation'] += 1
        elif 'curriculum' in prompt or 'subtopics' in prompt: intents['Curriculum Expansion'] += 1
        elif 'quiz' in prompt or 'evaluation' in prompt: intents['Quiz Evaluation'] += 1
        else: intents['Other'] += 1
        
    report += "## 🛠️ API Call Distribution\n"
    for intent, count in intents.items():
        report += f"- **{intent}:** {count} calls\n"
        
    report += "\n---\n*Report generated at " + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + "*"
    
    # Save to artifact directory
    artifact_path = "C:/Users/saivi/.gemini/antigravity/brain/295a20eb-07bb-4b20-a25d-dbf92df46fb7/ai_usage_report.md"
    with open(artifact_path, "w", encoding="utf-8") as f:
        f.write(report)
    
    print(f"Report generated: {artifact_path}")

if __name__ == "__main__":
    generate_usage_report()
