ICON REQUIREMENTS FOR TAILORAI CHROME EXTENSION
================================================

The extension requires three icon sizes:
- icon16.png (16x16 pixels) - Used in the extension toolbar
- icon48.png (48x48 pixels) - Used in the extension management page
- icon128.png (128x128 pixels) - Used in the Chrome Web Store

CREATING ICONS:
---------------

Option 1: Use an online tool
- Go to https://www.canva.com or https://www.figma.com
- Create a 128x128 pixel design with the TailorAI logo
- Design ideas:
  * A pen/quill icon with "T" or "AI" text
  * A document with sparkles (representing AI enhancement)
  * A tailored suit icon (representing "tailoring")
  * Use gradient colors: #667eea to #764ba2 (matches the extension theme)
- Export as PNG and resize for different sizes

Option 2: Use a placeholder generator
- Go to https://placeholder.com
- Generate simple colored squares temporarily
- URLs for quick placeholders:
  * 16x16: https://via.placeholder.com/16/667eea/ffffff?text=T
  * 48x48: https://via.placeholder.com/48/667eea/ffffff?text=T
  * 128x128: https://via.placeholder.com/128/667eea/ffffff?text=T

Option 3: Hire a designer
- Use Fiverr or 99designs for professional icons
- Provide the brand colors: #667eea and #764ba2
- Request all three sizes

TEMPORARY SOLUTION:
------------------
For development purposes, you can use any PNG images of the right size.
Just rename them to icon16.png, icon48.png, and icon128.png.

The extension will work without proper icons, but Chrome will show warnings
when you try to load it.

QUICK FIX:
----------
Use this command to create simple placeholder PNGs (requires ImageMagick):

convert -size 16x16 xc:#667eea icon16.png
convert -size 48x48 xc:#667eea icon48.png
convert -size 128x128 xc:#667eea icon128.png

Or use an online PNG creator like:
https://png-pixel.com
