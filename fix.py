import sys

try:
    with open('index.html', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    in_bubble = False
    bubble_count = 0
    for i in range(len(lines)):
        if '<a href="produtos.html" class="age-bubble reveal-scale"' in lines[i]:
            lines[i] = lines[i].replace('<a href="produtos.html"', '<div')
            in_bubble = True
        elif in_bubble and '</a>' in lines[i]:
            lines[i] = lines[i].replace('</a>', '</div>')
            in_bubble = False
            bubble_count += 1
            
    with open('index.html', 'w', encoding='utf-8') as f:
        f.writelines(lines)
        
    print(f'Replaced {bubble_count} bubbles.')
except Exception as e:
    print(f'Error: {e}')
