# Quick Start Guide

## Running the Application

```bash
cd pc-build-assistant
npm install  # if not already done
npm run dev
```

Then open http://localhost:5173 in your browser.

## New Features Quick Reference

### 🌓 Theme Toggle
- **Where**: Top-right corner of header
- **How**: Click the sun/moon icon
- **Effect**: Switches between light and dark mode instantly

### 🏠 Home Navigation
- **Where**: "PC Build Assistant" heading (center of header)
- **How**: Click the heading text
- **Effect**: Returns to preferences page from anywhere

### 💡 Hover Tooltips
- **Where**: All metric bars and gauges in build wizard
- **How**: Hover your mouse over any bar or gauge
- **Effect**: Shows exact values and percentages

### 🏢 Brand Preferences
- **Where**: Preferences form (both Beginner and Advanced modes)
- **Section**: After "Upgrade Horizon" section
- **Brands**: Intel, AMD, NVIDIA, ASUS, MSI, Gigabyte, Corsair, Samsung
- **How**: Click brand buttons to toggle selection

### 🖼️ Custom Icons
- **Where**: PC Architecture Visual (bottom of build wizard)
- **Setup**: Place PNG files in `/public/assets/components/`
- **Files needed**:
  ```
  cpu.png
  gpu.png
  motherboard.png
  ram.png
  storage.png
  psu.png
  ```

## Testing Checklist

- [ ] Theme toggle works
- [ ] Header click returns home
- [ ] Tooltips show on hover
- [ ] Brand preferences visible in beginner mode
- [ ] Only 5 connection lines in PC visual (no Storage→GPU, no CPU→PSU)
- [ ] Custom icons load (if added)
- [ ] Compatibility filtering works
- [ ] Groq AI responds to queries

## Common Issues

**Theme not changing?**
- Hard refresh (Ctrl+F5)

**Icons not showing?**
- Check file names are lowercase
- Verify files are in `/public/assets/components/`

**AI not responding?**
- Check `.env` has `VITE_GROQ_API_KEY`
- System uses fallback if API unavailable

## File Locations

- Theme code: `src/App.tsx`, `src/App.css`
- Brand preferences: `src/components/PreferenceForm.tsx`
- PC visual: `src/components/PCArchitectureVisual.tsx`
- Tooltips: `src/components/BuildMetricsDisplay.tsx`
- Icons: `/public/assets/components/`

## Support

For detailed information, see:
- `IMPLEMENTATION_COMPLETE.md` - Full feature documentation
- `CHANGES_SUMMARY.md` - Technical changes made
- `public/assets/components/README.md` - Icon specifications
