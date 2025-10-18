# San José Gregorio Hernández Website

A tribute site dedicated to San José Gregorio Hernández, the first Venezuelan saint, canonized on October 19, 2025. This project provides a secure, accessible, and modern web experience for sharing his life, legacy, and miracles.

## Features

- **Secure Redirect System**
  - Server-side redirect via `index.php` (preferred)
  - Client-side fallback via `index.html` and `index.js`
  - Triple-layer protection: PHP, JavaScript, and HTML meta refresh
- **Image Lightbox Viewer**
  - Clickable images open in a high-resolution, accessible lightbox
  - Keyboard and mobile navigation
  - ARIA and accessibility best practices
- **Security Best Practices**
  - Strict Content Security Policy (CSP)
  - X-Frame-Options, Referrer-Policy, Permissions-Policy headers
  - Whitelist-based redirect logic to prevent open-redirects and XSS
- **Responsive Design**
  - Works on desktop and mobile devices

## Project Structure

```
├── index.html                # Static entry point (client-side redirect)
├── index.php                 # Server-side redirect (preferred)
├── index.js                  # Secure client-side redirect logic
├── jose_gregorio_hernandez.html # Main content page
├── lightbox.js               # Image lightbox viewer
├── images/                   # Image assets (high-res and thumbnails)
│   ├── Canonizacion.png
│   ├── José_Gregorio_Hernendez-1.jpg
│   ├── José_Gregorio_Hernendez-2.jpg
│   └── José_Gregorio_Hernendez-3.jpg
└── README.md                 # Project documentation
```

## Usage

1. **Deploy to any PHP-enabled server**
   - `index.php` will handle all redirects securely.
2. **Deploy to static hosting (no PHP)**
   - `index.html` will redirect using meta refresh and `index.js`.
3. **Main content**
   - All users are redirected to `jose_gregorio_hernandez.html`.
   - Images are clickable and open in a lightbox.

## Adding Images to the Lightbox
- Add your image to the `images/` folder.
- In `jose_gregorio_hernandez.html`, use the classes `.main-image`, `.section-image`, or `.gallery-image` for any image you want to be clickable.
- For high-resolution versions, add a `data-fullsize` attribute:
  ```html
  <img src="images/thumbnail.jpg" data-fullsize="images/high-res.jpg" class="gallery-image" alt="Descripción">
  ```

## Credits
- **Site Author:** Julian Bolívar
- **Dedication:** San José Gregorio Hernández, canonized October 19, 2025
- **Date:** October 18, 2025
- **Website:** josegregoriohernandez.info

## License
This project is licensed under the GNU General Public License v3. See [LICENSE.md](LICENSE.md) for details.

