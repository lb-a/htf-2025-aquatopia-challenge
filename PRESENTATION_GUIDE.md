# Presentation Guide

## Running the Presentation

### Prerequisites
Install presenterm:
```bash
cargo install presenterm
```

### Basic Usage
```bash
presenterm presentation.md
```

### With Speaker Notes
To view speaker notes while presenting, run two terminals:

**Terminal 1 (Main Presentation):**
```bash
presenterm presentation.md --publish-speaker-notes
```

**Terminal 2 (Speaker Notes):**
```bash
presenterm presentation.md --listen-speaker-notes
```

### Navigation
- **Arrow Keys**: Navigate between slides
- **Space/Enter**: Next slide
- **q**: Quit presentation
- **?**: Show help

### Export Options
```bash
# Export to PDF
presenterm presentation.md --export-pdf output.pdf

# Export to HTML
presenterm presentation.md --export-html output.html
```

## Customization

### Themes
The presentation uses the `navy` theme. You can change it in the frontmatter:
- `light`
- `rust`
- `coal`
- `navy` (current)
- `ayu`

### Interactive Features
The presentation includes:
- **Incremental Lists**: Items appear one by one
- **Column Layouts**: Side-by-side content
- **Pauses**: Controlled information flow
- **Speaker Notes**: Guidance for each slide

## Filling in Speaker Notes

Look for `[FILL IN]` markers in the presentation and add:
- Specific examples
- Actual numbers (time, deployments, team size)
- Memorable moments
- Detailed explanations

## Tips

1. **Practice First**: Run through the presentation to familiarize yourself with the flow
2. **Customize**: Add your team's specific experiences and numbers
3. **Speaker Notes**: Use the speaker notes feature for guidance during presentation
4. **Test Images**: Make sure the architecture image displays correctly
5. **Time Management**: The presentation is designed to be ~15-20 minutes

