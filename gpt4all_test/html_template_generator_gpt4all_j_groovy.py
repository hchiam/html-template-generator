# -*- coding: utf-8 -*-
"""html-template-generator_gpt4all-j_groovy.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1tNiNcMdmlyuoAQoKOAkZ0hF80P7N79E0
"""

# Commented out IPython magic to ensure Python compatibility.
# %%capture
# !pip install gpt4all
# import gpt4all
# model = gpt4all.GPT4All("ggml-gpt4all-j-v1.3-groovy.bin")
# # model.chat_completion() doc: https://docs.gpt4all.io/gpt4all_python.html#gpt4all.gpt4all.GPT4All.chat_completion
# # other documentation: https://github.com/nomic-ai/gpt4all/blob/main/gpt4all-bindings/python/docs/gpt4all_python.md

def print_response(prompt: str) -> str:
  messages = [{'role': 'user', 'content': prompt}]
  response = model.chat_completion(messages)
  print(response)
  # print(response.get('choices',[{'message':{'content':''}}])[0]['message']['content'])

print_response("""
# Templates:

## dropdown template:
```html
<select class="custom-control">
  <option value="">- Please select -</option>
  <option value="1">1</option>
  <option value="2">2</option>
</select>
```

## radio template:
```html
<input class="custom-control" type="radio"/>
```

# Task:
Use just one of the templates above to write HTML code for a dropdown of the Canadian provinces/territories, with these values:
Alberta
British Columbia
Manitoba
New Brunswick
Newfoundland and Labrador
Northwest Territories
Nova Scotia
Nunavut
Ontario
Prince Edward Island
Quebec
Saskatchewan
Yukon
""")