---
name: glm-coder
description: Use GLM-5.3-Thinking via UnoRouter to generate, edit, or refactor code in any file in the workspace whenever the user requests GLM to code or write code.
---

# GLM Coder Workflow

When the user asks to code with GLM or write/edit files using `glm-5.3-thinking:free`:

1. Send the file content and instructions to `glm-5.3-thinking:free` via the UnoRouter API.
2. UnoRouter Endpoint: `https://api.unorouter.com/v1/chat/completions`
3. Model: `glm-5.3-thinking:free`
4. Use the helper script at `C:\Users\AMAN\.gemini\config\skills\glm-coder\scripts\glm_generate.js` or direct API call.
5. Take the generated code from GLM and use `replace_file_content` or `write_to_file` to apply the changes directly into the user's file.
