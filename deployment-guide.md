# YT-Sentiment-Analysis Browser Extension Project

## Project Folder Contents:

### backend/
- `backend\model\final_model\config.json`
- `backend\model\final_model\model.safetensors`
- `backend\model\final_model\tokenizer_config.json`
- `backend\model\final_model\tokenizer.json`
- `backend\.env`:
```python
    ALLOWED_ORIGINS=http://12.34.56.78,https://87.65.43.21
```
- `backend\requirements.txt`:
```python
    fastapi
    uvicorn
    requests
    python-dotenv
    pydantic
    python-multipart
    torch
    transformers
```
- `backend\app.py`
- `backend\.dockerignore`

### extension/
- `extension\dist\assets\index-81-3evn1.css`
- `extension\dist\assets\index-BYry2sXM.js`
- `extension\dist\index.html`
- `extension\dist\manifest.json`
- `extension\.env`:
```jsx
    VITE_BACKEND_URL=http://localhost:8000
```

## My Requirement:

- `backend` deploymeny in `AWS` (Whichever the suitable service).
- For that, I need to write a proper `Dockerfile` for the `backend`.
---

- Priorities: {First: "Free Tier Services", Second: "Resume worthy production scalability", Third: "Easy Management"}
---
I want to Deploy this using `AWS App Runner + ECR`.
- Then I can call it from elsewhere/ anywhere (browser extension).
However,
- The `backend\model` alone is `256MB`.
- The `backend\` is also almost `900MB`.
- So, keep that in mind particularly.
---

- First of all, understand what I'm about to do.

# Final Verdict:

- We use `AWS App Runner + ECR`
- Workflow in brief:
```md
`My PC (Local) → Build Docker Image → ECR (Storage) → App Runner (Compute) → Public URL → Extension (User's Browser)`
  1. I build Docker image locally
  2. I push image to ECR
  3. App Runner pulls image from ECR
  4. App Runner gives me URL: https://my-app.awsapprunner.com
  5. Extension calls: https://your-app.awsapprunner.com/fetch-comments
  6. App Runner runs my FastAPI code
  7. The code calls YouTube API (key safe in backend)
  8. Results returned to extension
```

- If you understand what is to be done, just reflect briefly in your own words.
- If you are updated with the workflow and possible to do it, provide the Dockerfile first.
- DO NOT THINK OF SOPHISTICATED IDEAS.
- I JUST WANT TO DO THIS REALLY FAST & EASY.
