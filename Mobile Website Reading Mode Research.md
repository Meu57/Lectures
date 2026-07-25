# **Architecting the Digital Page: Engineering a Native Book-Like Reading Experience on Mobile Web Platforms**

The transition of long-form reading from the physical medium of ink and paper to the digital medium of mobile screens has historically been accompanied by a shift in spatial navigation. While the printed book relies on discrete, horizontally paginated surfaces, the default behavior of the web is the infinite vertical scroll. This scrolling paradigm, optimized for the rapid consumption of highly dynamic, fragmented feeds, introduces significant cognitive and physiological friction when applied to immersive, long-form reading. Users frequently experience visual fatigue, spatial disorientation, and an inability to achieve a sustained flow state when consuming extended articles on mobile websites. Conversely, dedicated electronic reading applications and browser-native reader modes successfully emulate the tactile and cognitive comfort of a physical book.  
Achieving this "hardcopy" experience within a mobile web browser requires transcending the default scrolling behavior. It demands a meticulous synthesis of typographic science, spatial architecture, client-side content extraction, hardware interaction management, and advanced CSS layout capabilities. By engineering these elements, web platforms can construct an opt-in reading mode that mirrors the physical, paged experience of a book, thereby reducing cognitive load and maximizing reading comprehension.

## **1\. The Physiological and Cognitive Foundations of Digital Reading**

To engineer a comfortable reading environment, one must first understand the physiological mechanics of reading. The human eye does not glide smoothly across a line of text; rather, it moves in a series of rapid, jerky jumps known as saccades, interspersed with brief pauses called fixations, during which actual visual processing occurs.

### **1.1 The Science of Line Length and Tracking Fatigue**

The measure, or line length, is arguably the most critical variable in typographic readability. The relationship between line length and reading speed has been the subject of ergonomic research for over a century. Early studies by Weber in 1881 suggested an ideal line length of 100 millimeters for printed text, while Javel and Cohn shortly thereafter recommended 90 millimeters1. Modern eye-tracking research confirms that line length directly impacts saccadic eye movements. When a line is too short, the eye is forced to make excessive return sweeps to the beginning of the next line, breaking the natural reading rhythm and causing fatigue2. When a line is too long, the eye struggles to track back accurately to the start of the subsequent line, a phenomenon that significantly reduces comprehension and causes readers to lose their place2.  
For traditional desktop interfaces and printed materials, the optimal line length is widely accepted to be between 50 and 75 characters per line (CPL), with 66 CPL often cited as the perfect target2. Research by Dyson and Haselgrove indicates that a medium line length of approximately 55 CPL supports the most effective balance of speed and comprehension1. However, the constrained physical dimensions of mobile displays necessitate a deviation from desktop standards. To maintain a legible font size without forcing horizontal scrolling, the optimal line length for mobile reading must be reduced.

| Device Category | Optimal Line Length | Recommended Line Height Multiplier |
| :---- | :---- | :---- |
| Small Mobile (\< 320px) | 35–40 characters | 1.50 – 1.60 |
| Medium Mobile (320–500px) | 40–45 characters | 1.50 – 1.60 |
| Tablet (500–768px) | 45–65 characters | 1.45 – 1.55 |
| Desktop (\> 768px) | 50–75 characters | 1.30 – 1.50 |

To enforce these optimal character counts dynamically within a fluid mobile web layout, CSS constraints utilizing the ch (character) unit are highly effective. Applying a property such as max-width: 66ch; (or 45ch for strict mobile targeting) ensures that the text block scales intelligently, never exceeding the cognitive limits of the reader regardless of the device's physical resolution3.

### **1.2 Fluid Typography and Scale**

A pervasive anti-pattern in mobile web design is the assumption that smaller screens require smaller text. In reality, the ambient light interference, screen glare, and variable holding distances associated with mobile devices demand robust, highly legible typography7. Tiny fonts induce ocular tension and headaches, as the user is forced to squint or manually zoom, which subsequently breaks the layout7. The absolute minimum base font size for body text on mobile devices is 16px, though sizes of 18px to 20px are frequently preferred for extended reading sessions to reduce strain3.  
Modern CSS provides the clamp() function, enabling fluid typography that scales seamlessly relative to the viewport while adhering to strict minimum and maximum boundaries. This eliminates the abrupt layout shifts associated with traditional media query breakpoints.

CSS  
body {  
  /\* Minimum of 16px, scales with the viewport width, maximum of 22px \*/  
  font-size: clamp(1rem, 0.875rem \+ 0.5vw, 1.375rem);  
}

This fluid scaling ensures that the text always feels substantial and effortless to read, mimicking the accessibility of large-print physical books3.

### **1.3 Vertical Rhythm and the Mathematics of Spacing**

Leading, or line height, defines the vertical space between the baselines of consecutive lines of text. Adequate leading is essential; it provides the spatial "breathing room" that allows the eye to differentiate one line from the next during a return sweep. A universal best practice for digital body copy is to set the line height to 1.5 to 1.6 times the font size2.  
The relationship between line length and line height is deeply intertwined. As line length increases, the line height must proportionally increase to help the eye track back to the left margin without vertical drift3. Conversely, shorter line lengths, such as those strictly enforced on mobile screens, can tolerate slightly tighter leading, though a multiplier of 1.5 remains the safest baseline for accessibility3.  
To ensure this spacing remains proportional if the user alters their default font size, developers must use unitless values or relative units (e.g., line-height: 1.5; or 1.5em), avoiding rigid pixel definitions6.

## **2\. Micro-Typography and Accessibility Standards**

Creating a reading experience that feels as comfortable as a printed book requires attention to the micro-typographic details that are often handled automatically by print layout software but must be explicitly coded on the web.

### **2.1 Web Content Accessibility Guidelines (WCAG) for Text**

To accommodate readers with low vision, dyslexia, or cognitive impairments, a reading mode must not only provide sensible defaults but also ensure that the text architecture can adapt to user overrides without breaking. The WCAG 2.1 guidelines establish specific metrics for text spacing that a robust reading mode must support gracefully11.

| Typographic Element | WCAG Minimum Requirement (Relative to Font Size) |
| :---- | :---- |
| Line Height (Leading) | At least 1.5x |
| Paragraph Spacing | At least 2.0x |
| Letter Spacing (Tracking) | At least 0.12x |
| Word Spacing | At least 0.16x |

Implementing these metrics ensures that individual characters and words remain intact and legible, preventing the crowding that exacerbates dyslexia and visual tracking disorders11.

### **2.2 Alignment, Hyphenation, and Text Rag**

The alignment of text drastically alters the reading experience. While printed books almost universally utilize fully justified text (aligned flush to both the left and right margins), attempting full justification on the web is highly detrimental. Mobile web browsers lack the sophisticated optical margin alignment and hyphenation algorithms of software like Adobe InDesign. Consequently, justifying text on the web stretches the spaces between words unevenly, creating distracting "rivers" of white space that disrupt the saccadic rhythm3.  
Therefore, text in a mobile reading mode must be left-aligned (ragged right). A clear, consistent left edge provides a reliable anchor for the eye at the start of every new line, maximizing scanning efficiency3.  
To further polish the ragged right edge and prevent jarring visual gaps at the end of lines, automatic hyphenation should be enabled using the CSS property hyphens: auto; alongside a declared language attribute in the HTML2. Furthermore, to prevent single lines of a paragraph from being marooned at the top or bottom of a generated column (a critical issue when building paged layouts), CSS properties for widows and orphans should be set to a minimum value of 2 or 32.

### **2.3 Advanced Font Features**

The selection of the typeface itself carries both aesthetic and functional weight. Serifs (e.g., Merriweather, Georgia) are traditionally favored for long-form reading because their terminal strokes physically guide the eye along the horizontal axis, binding words together2. Modern humanist sans-serifs (e.g., Open Sans, Inter) also perform exceptionally well on high-density mobile screens due to their large x-heights, which open up the internal negative space of lowercase letters, rendering them highly legible at small sizes9.  
Modern reading modes should leverage variable fonts and OpenType features to refine the display. Using font-feature-settings: "liga" 1, "onum" 1; enables standard ligatures (connecting awkward letter combinations like "fi" or "fl") and oldstyle figures (numbers that vary in height to blend seamlessly with lowercase text, rather than jarringly standing out as capital letters)10.

## **3\. Spatial Harmony: Margins and Implicit Containment**

A defining characteristic of a physical book is the negative space surrounding the text block. The margins provide a place for the reader's thumbs to rest without obscuring the content and create a conceptual boundary that isolates the narrative from the outside world.

### **3.1 Establishing the Page Boundary**

A common error in mobile web design is allowing text to bleed directly to the edge of the screen, or providing negligible margins that induce a feeling of claustrophobia2. On a mobile device, side margins should be set between 16px and 25px (1rem to 1.5rem)5. This ensures that the text does not curve around the physical bezel of the device or fall under the user's thumb16.  
As the viewport widens (e.g., on tablets or desktop monitors), the body region should remain constrained to the optimal character width, while the margins expand fluidly. According to Material Design guidelines, margins can increase up to 200dp on large screens, ensuring the central column of text remains ergonomically sound rather than stretching into an unreadable panoramic band15.

### **3.2 Visual Grouping and Separation**

Within the text itself, spatial relationships dictate meaning. Paragraphs should not be indented; instead, web convention utilizes vertical white space to delineate thoughts5. The space between paragraphs should equal at least one full blank line (e.g., margin-bottom: 1.5em;). If the space is less than 0.5em, the separation is ambiguous; if it exceeds 1.5em, the narrative flow is unnecessarily interrupted5.  
Furthermore, typographic hierarchy must be enforced spatially. Headings must be visually anchored to the text they introduce. The white space preceding a heading should be significantly larger (e.g., 1.5 times to 2 times greater) than the space following it2. This application of "implicit containment" utilizes proximity to group related concepts, reducing the cognitive load required to parse the document structure15.

## **4\. The Distraction-Free Environment: Client-Side Content Extraction**

Before a web page can be formatted to resemble a book, the core narrative must be surgically extracted from the surrounding commercial and navigational scaffolding of the modern web. Mobile screens lack the real estate for sidebars, sticky headers, pop-up newsletters, and inline advertisements; these elements obliterate the immersion required for deep reading7.  
To achieve this, platforms can implement client-side content extraction algorithms, the most prominent of which is Mozilla's Readability.js. This is the exact open-source algorithm that powers the native Reader View in the Firefox browser18.

### **4.1 The Heuristics of Readability.js**

Readability.js operates by ingesting the Document Object Model (DOM) and running a complex series of heuristic evaluations to identify the primary content-bearing nodes while aggressively pruning extraneous material19.  
The algorithm executes the following sequence:

> 1. **Cloning and Initialization:** The algorithm operates on a clone of the DOM to prevent destructive mutations to the live webpage19.  
> 2. **Transformability Assessment:** An initial lightweight pass, utilizing the isProbablyReaderable function, checks if the document contains sufficient text volume and appropriate structural tags to warrant extraction19.  
> 3. **Node Scoring:** The algorithm evaluates nodes based on their HTML attributes (IDs, classes). Positive identifiers, such as classes containing article, body, content, or story, receive score multipliers. Conversely, nodes flagged with negative identifiers like comment, sidebar, banner, ad, or menu are penalized and slated for removal23.  
> 4. **Density and Structural Analysis:** Readability assesses the ratio of text to hyperlinks within paragraphs. Blocks with high link density and low textual substance are discarded as navigational menus. It also evaluates paragraph lengths, stripping out fragments that are too short to be considered main content18.

### **4.2 Implementation and Security Considerations**

Integrating Readability.js into a web application involves instantiating the parser and injecting the resulting sanitized HTML into a dedicated reading container.

JavaScript  
// Example implementation of Readability.js  
const documentClone \= document.cloneNode(true);  
const reader \= new Readability(documentClone, {  
  charThreshold: 500, // Customize minimum character requirements  
  keepClasses: false  // Strip original styling hooks  
});  
const article \= reader.parse();

if (article) {  
  // The resulting object contains the title, author, excerpt, and clean HTML content  
  renderReadingMode(article.title, article.byline, article.content);  
}

Because this process deals with arbitrary HTML, security is paramount. The extracted article.content must be passed through a strict HTML sanitizer, such as DOMPurify, prior to being injected back into the DOM. This mitigates the risk of Cross-Site Scripting (XSS) attacks by neutralizing any malicious scripts that may have bypassed the extraction heuristics19.  
Beyond rendering reading interfaces, this purified text output (accessible via the textContent property in the parsed object) is increasingly utilized in data ingestion pipelines. It serves as an optimal, noise-free input for Large Language Models (LLMs) and Retrieval-Augmented Generation (RAG) applications, ensuring that vector embeddings are generated purely from the narrative content rather than boilerplate navigation20.

## **5\. Emulating the Physical Page: Architecting Horizontal Pagination**

The most profound psychological disconnect between reading on the web and reading a physical book is the axis of movement. The web scrolls continuously along the vertical axis (y-axis). A book is consumed in discrete, horizontally paginated chunks (x-axis).  
Vertical scrolling requires continuous fine-motor engagement and disrupts spatial memory—the reader's subconscious ability to recall where a specific piece of information was located on the page geometry. To truly recreate the "hardcopy" experience, the application must convert the continuous vertical scroll of the extracted content into a horizontally paginated layout25.

### **5.1 The CSS Multi-Column Pagination Engine**

The foundational mechanism for achieving this in the browser is the CSS Multi-column Layout module. By constraining the height of a container to exactly the height of the mobile viewport, any overflowing text can be forced to generate new columns along the horizontal axis25.

CSS  
.reading-environment {  
  /\* Constrain to the exact dimensions of the screen \*/  
  height: 100vh;  
  width: 100vw;  
    
  /\* Create columns that precisely match the viewport width \*/  
  column-width: 100vw;  
  column-gap: 0;  
    
  /\* Suppress vertical scrolling, enable horizontal overflow \*/  
  overflow-y: hidden;  
  overflow-x: scroll;  
    
  /\* Ensure padding is calculated within the viewport dimensions \*/  
  box-sizing: border-box;  
  padding: 1rem 1.5rem;  
}

In this architecture, the browser's layout engine slices the continuous text into distinct "pages." Because the column-width is set to 100vw, each generated column occupies exactly one screen width. The user can now navigate the article by moving horizontally rather than vertically26.

#### **5.1.1 Overcoming Legacy Sub-Pixel Layout Bugs**

Historically, implementing this technique required navigating complex browser rendering bugs. Older versions of WebKit suffered from severe layout fractures if the container's height was not an exact integer multiple of the text's line height. If the calculation resulted in a fractional pixel, lines of text would be horizontally sheared at the bottom of the column26.  
To circumvent this, developers employed complex percentage-based math. By ensuring that all paragraphs utilized a strict pixel-based line height (e.g., 25px), and forcing the container height calculation to resolve to a multiple of 25 (e.g., body { height: 4%; } and article { height: 2500%; }), the browser was coerced into utilizing clean integer calculations, preventing text clipping26. While modern layout engines handling sub-pixel rendering have largely resolved this, maintaining a strict vertical rhythm where container heights are mathematically aligned with line heights remains a best practice for complex multi-column flows.

### **5.2 Creating the Mechanical "Snap"**

While CSS columns generate the horizontal pages, a standard horizontal scroll still lacks the mechanical, discrete sensation of turning a page. If the user stops swiping midway, the screen will display the right half of one page and the left half of the next, destroying readability27.  
This is resolved using the CSS Scroll Snapping module. This API allows the developer to define strict anchor points within a scrollable container. Because it is handled by the browser's compositor thread, it operates with hardware-accelerated smoothness without the heavy scripting overhead of legacy JavaScript sliders28.

CSS  
.reading-environment {  
  /\* Force the browser to rest only on designated snap points \*/  
  scroll-snap-type: x mandatory;  
}

.reading-environment \> \* {  
  /\* Align each generated column to the center of the viewport \*/  
  scroll-snap-align: center;  
  /\* Prevent the user from skipping past multiple pages in a single fast swipe \*/  
  scroll-snap-stop: always;   
}

The scroll-snap-type: x mandatory declaration guarantees that when the user releases their finger, the viewport will magnetically snap to the nearest page boundary, never resting in an intermediate state28. The scroll-snap-stop: always property enforces a one-page-per-swipe cadence, mimicking the physical constraint of turning a single sheet of paper28.

### **5.3 Polyfilling Complex Layouts: FTColumnflow**

While native CSS columns handle continuous text beautifully, they struggle with complex editorial elements. Native CSS only supports column-span: none or column-span: all. If an article requires an image to span exactly two out of three columns, or if it requires complex fixed-position headers intertwined with flowed text, pure CSS falls short26.  
For publications requiring intricate, magazine-style paged layouts on the web, JavaScript polyfills like FTColumnflow (developed by the Financial Times) have historically been utilized. Rather than executing highly expensive DOM manipulations (splitting text nodes word-by-word), FTColumnflow utilizes an ingenious overflow: hidden technique. It copies an entire paragraph into a new column, but applies a negative top margin equal to the overflow amount from the previous column. This shifts the text upward, seamlessly revealing the next line of text at the top of the new column26. This relies heavily on a rigid baseline grid to ensure lines are not horizontally sliced.

### **5.4 Simulating Touch Interaction**

Dedicated e-readers like the Kindle allow users to paginate simply by tapping the edges of the screen, a motion requiring less ergonomic effort than a full horizontal swipe. This can be layered over the CSS scrolling engine using a lightweight JavaScript event listener26.

JavaScript  
document.body.addEventListener('click', function(e) {  
  // Prevent interference with interactive elements  
  if (e.target.closest('a, button, interactive-element')) return;  
    
  e.preventDefault();  
  const screenWidth \= window.innerWidth;  
    
  // Tap on the right 50% turns the page forward  
  if (e.clientX \> (screenWidth / 2)) {  
    window.scrollBy({ left: screenWidth, behavior: 'smooth' });  
  }   
  // Tap on the left 50% turns the page backward  
  else {  
    window.scrollBy({ left: \-screenWidth, behavior: 'smooth' });  
  }  
});

This architecture—DOM cloning via Readability, horizontal slicing via CSS columns, tactile snapping via CSS Scroll Snap, and ergonomic pagination via JavaScript—results in a mobile web experience indistinguishable from a native reading application.

## **6\. Visual Comfort and Colorimetry**

The harsh contrast of absolute black text (\#000000) on a stark white background (\#FFFFFF) emits excessive blue light. On backlit mobile screens, this causes halation (a blurring effect around the edges of letters) and astigmatic strain, significantly reducing the duration a user can comfortably read. Reading modes mitigate this by utilizing specific colorimetric tuning, most notably Sepia and Dark themes32.

### **6.1 The Mechanics of the Sepia Theme**

A Sepia theme replaces the stark white background with a warm, brownish-yellow tone reminiscent of aged paper. This reduces blue light emission, mitigating the disruption of circadian rhythms and providing a softer, more organic visual experience32.  
While developers can manually assign specific hex codes (e.g., background \#F7F0DF or \#e9d8ba35), the CSS filter property offers a highly efficient, global transformation mechanism. The sepia() CSS function converts the entire rendering context of the container to a warmer spectrum34.

CSS  
.theme-sepia {  
  /\* Apply a 100% sepia tint to the container \*/  
  filter: sepia(100%);  
  background-color: \#f4f4f4; /\* A soft off-white base \*/  
  color: \#333333; /\* Dark gray text reduces halation \*/  
}

For maximum comfort, these filters can be mathematically chained. For example, applying filter: sepia(40%) contrast(90%); achieves a subtle brownish tint while intentionally softening the contrast of the black text to reduce glare36. High contrast remains essential for accessibility, so designers must ensure the resulting combination maintains a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text, adhering to WCAG standards6.

### **6.2 Designing a True Dark Mode**

Dark mode operates by inverting the typical color palette, which is crucial for night reading. However, directly inverting colors to achieve pure white (\#FFFFFF) text on a pure black (\#000000) background creates a high-contrast vibrating effect that induces eye fatigue38.  
A properly engineered dark mode utilizes a dark gray background to absorb light without creating total darkness, paired with off-white text to lower the intensity of the light emission38.

| Theme Property | Recommended Dark Mode Value | Recommended Light Mode Value |
| :---- | :---- | :---- |
| Background Color | \#181a1b (Dark Gray) | \#dcdad7 (Soft Off-White) |
| Text Color | \#e8e6e3 (Off-White) | \#181a1b (Dark Gray/Black) |

Modern reading applications should automatically respect the user's operating system preferences by utilizing the @media (prefers-color-scheme: dark) CSS media query32. To provide users with manual override capabilities without complex JavaScript state management, custom HTML elements like \<dark-mode-toggle\> can be integrated, which seamlessly manage the switching of CSS classes or stylesheets based on user input and store the preference locally40.

## **7\. Sustained Immersion: The Screen Wake Lock API**

A subtle but catastrophic flaw in web-based reading experiences is the operating system's screen timeout logic. Native applications, such as Apple Books or Amazon Kindle, instruct the OS to keep the screen awake as long as the application is active. Conversely, a mobile web browser assumes the user is idle if they are not actively touching the screen. Because reading a paginated digital book involves staring at a static screen for minutes at a time, the display will inevitably dim and lock mid-paragraph.  
Historically, web developers bypassed this limitation using resource-intensive hacks, such as playing a hidden, silent looping video (e.g., the legacy implementation of NoSleep.js) to deceive the device into remaining awake41. Today, this requirement is solved securely and natively via the W3C Screen Wake Lock API41.

### **7.1 Acquiring and Managing the Wake Lock**

The Wake Lock API provides a Promise-based mechanism to request uninterrupted screen time from the device's operating system41. When the user activates the reading mode, the application requests the lock using navigator.wakeLock.request('screen').

JavaScript  
let wakeLockSentinel \= null;

const requestWakeLock \= async () \=\> {  
  try {  
    // Request permission from the OS to keep the display active  
    wakeLockSentinel \= await navigator.wakeLock.request('screen');  
    console.log('Screen Wake Lock acquired.');  
      
    // Listen for unexpected lock releases  
    wakeLockSentinel.addEventListener('release', () \=\> {  
      console.log('Screen Wake Lock was released by the system.');  
    });  
  } catch (err) {  
    // Requests can be denied due to low battery or permissions policies  
    console.error(\`Wake Lock error: ${err.name}, ${err.message}\`);  
  }  
};

The request returns a WakeLockSentinel object. This object acts as a handle; the developer can proactively release the lock by calling wakeLockSentinel.release() when the user exits reading mode, preserving the device's battery life41.

### **7.2 Handling Visibility State and OS Revocation**

The operating system enforces strict power management and security policies regarding wake locks. If the user switches browser tabs, minimizes the browser, locks the device manually, or if the device enters extreme battery saver mode, the OS will aggressively and automatically revoke the wake lock41.  
Therefore, a robust reading mode cannot simply request the lock once. It must monitor the Document's visibilitychange event. When the user returns to the reading tab (flipping the visibility state back to "visible"), the application must automatically re-acquire the lock; otherwise, the screen will begin its standard dimming countdown41.

JavaScript  
document.addEventListener('visibilitychange', async () \=\> {  
  // If the document becomes visible again, and a lock was previously intended  
  if (document.visibilityState \=== 'visible' && wakeLockSentinel \!== null) {  
    await requestWakeLock();  
  }  
});

In modern React-based architectures, this intricate lifecycle management—requesting the lock, handling OS rejections, and listening for visibility changes—is typically abstracted into custom hooks (e.g., useWakeLock), which manage the state of the WakeLockSentinel entirely behind the scenes47. By correctly implementing the Wake Lock API, the web application achieves absolute behavioral parity with installed native reading software, allowing for deep, uninterrupted immersion42.

## **8\. Scaling to Full Electronic Publication Standards**

While extracting HTML via Readability.js and formatting it with CSS columns is highly effective for individual web articles, platforms aiming to deliver full-length manuscripts, serialized fiction, or textbooks require architecture capable of handling standardized digital book formats.  
The global standard for digital books is the EPUB format. An EPUB is fundamentally a zipped archive containing a collection of HTML5 files, CSS stylesheets, images, and XML metadata dictating the spine (reading order) and table of contents52. Building a reader that can unpack, parse, and render an EPUB natively in the browser without backend processing requires specialized libraries, the most prominent being epub.js52.

### **8.1 The Architecture of epub.js**

epub.js functions as a comprehensive rendering manager. It utilizes dependencies like JSZip to decompress the EPUB archive entirely on the client side52.

> 1. **Metadata Extraction:** It parses the container.xml to locate the Rootfile (OPF), extracting the book's manifest and spine order57.  
> 2. **Memory Management:** Rather than injecting a 500-page book into the DOM simultaneously (which would crash mobile browsers), it renders only the current chapter into a sandboxed iframe. It then calculates the geometry of the text and applies pagination algorithms dynamically52.  
> 3. **Flow Management:** The library offers distinct rendering flows. Setting flow: "paginated" initiates the horizontal, column-based rendering discussed previously, while flow: "scrolled" reverts to a continuous vertical presentation52.  
> 4. **Security:** Because EPUBs can contain embedded JavaScript, epub.js disables scripts by default. If interactive content is required, developers can pass an allowScriptedContent: true flag, though this requires careful server-side sanitization to prevent executing malicious code within the iframe sandbox52.

By leveraging an engine like epub.js, developers are insulated from the complex mathematics required to maintain pagination state when a user alters the font size or line height. The library automatically recalculates the DOM geometry and re-paginates the content, providing a flawless, scalable book reading experience52.

## **9\. Conclusion**

Transforming the chaotic, vertically scrolling environment of the mobile web into a serene, book-like reading experience represents a triumph of modern web architecture. It demands the rejection of default browser behaviors in favor of highly engineered, purpose-built environments.  
By adhering strictly to typographic ergonomics—specifically limiting line length to 35–50 characters, utilizing fluid scaling, and managing the delicate mathematics of leading and micro-typography—designers protect the user from visual and cognitive fatigue. Spatial architecture, combined with powerful client-side extraction algorithms like Readability.js, silences the commercial noise of the modern web. The mechanical, tactile sensation of holding a physical page is perfectly emulated through the union of CSS Multi-column layouts, strict CSS Scroll Snapping, and JavaScript touch event listeners. Furthermore, sophisticated colorimetry, including Sepia filtering and low-contrast Dark Modes, ensures that the digital page respects the physiological limits of the human eye, while the Screen Wake Lock API guarantees uninterrupted immersion.  
When orchestrated systematically, these web technologies coalesce to create a native reading experience that not only rivals the printed page in comfort but, through its dynamic adaptability and accessibility, surpasses it.

#### **Works cited**

> 1. Optimal Line Length \- Human Factors International, [https://www.humanfactors.com/newsletters/optimal\_line\_length.html](https://www.humanfactors.com/newsletters/optimal_line_length.html)  
> 2. Typography for Long-Form Reading: Designing Pages People Actually Finish, [https://www.designer-daily.com/typography-for-long-form-reading-designing-pages-people-actually-finish-213373](https://www.designer-daily.com/typography-for-long-form-reading-designing-pages-people-actually-finish-213373)  
> 3. Optimal Line Length for Readability: The 50–75 Character Rule Explained (2026) | UXPin, [https://www.uxpin.com/studio/blog/optimal-line-length-for-readability/](https://www.uxpin.com/studio/blog/optimal-line-length-for-readability/)  
> 4. Mobile Design Typography is Vitally Important … and Challenging \- Codrops, [https://tympanus.net/codrops/2012/11/12/mobile-design-typography-is-vitally-important-and-challenging/](https://tympanus.net/codrops/2012/11/12/mobile-design-typography-is-vitally-important-and-challenging/)  
> 5. Typography | U.S. Web Design System (USWDS) \- Digital.gov, [https://designsystem.digital.gov/components/typography/](https://designsystem.digital.gov/components/typography/)  
> 6. 10 Mobile Typography Tips for Better Readability \- OneNine, [https://onenine.com/10-mobile-typography-tips-for-better-readability/](https://onenine.com/10-mobile-typography-tips-for-better-readability/)  
> 7. Mobile Typography: 8 Steps Toward Powerful UI \- Tubik Studio, [https://tubikstudio.com/blog/mobile-typography-8-steps-toward-powerful-ui/](https://tubikstudio.com/blog/mobile-typography-8-steps-toward-powerful-ui/)  
> 8. Mobile Accessibility: Practical Techniques for Designers and Developers \- Inclusive Web, [https://www.inclusiveweb.co/accessibility-resources/mobile-accessibility-practical-techniques-for-designers-and-developers](https://www.inclusiveweb.co/accessibility-resources/mobile-accessibility-practical-techniques-for-designers-and-developers)  
> 9. Typography \- UI/UX Guidelines \- User Experience Design & Technology, [https://www.uxdt.nic.in/guidelines/design-system-overview/typography/](https://www.uxdt.nic.in/guidelines/design-system-overview/typography/)  
> 10. CSS Typography: Advanced Text Styling and Font Features \- DEV Community, [https://dev.to/sharique\_siddiqui\_8242dad/css-typography-advanced-text-styling-and-font-features-2kl2](https://dev.to/sharique_siddiqui_8242dad/css-typography-advanced-text-styling-and-font-features-2kl2)  
> 11. Understanding Success Criterion 1.4.12: Text Spacing | WAI \- W3C, [https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html?](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)  
> 12. Understanding typography \- Material Design, [https://m2.material.io/design/typography/understanding-typography.html](https://m2.material.io/design/typography/understanding-typography.html)  
> 13. The Impact of Typography on Mobile App Design | by Carol Flanders \- Medium, [https://medium.com/@MobileAppDesigner/the-impact-of-typography-on-mobile-app-design-2ac40bad3fbd](https://medium.com/@MobileAppDesigner/the-impact-of-typography-on-mobile-app-design-2ac40bad3fbd)  
> 14. Six tips for better web typography \- CSS-Tricks, [https://css-tricks.com/six-tips-for-better-web-typography/](https://css-tricks.com/six-tips-for-better-web-typography/)  
> 15. Understanding layout \- Material Design, [https://m2.material.io/design/layout/understanding-layout.html](https://m2.material.io/design/layout/understanding-layout.html)  
> 16. An in-depth (?) look into good text layouts | by Alexandre Tempel | UX Collective, [https://uxdesign.cc/an-in-depth-look-into-good-text-blog-layouts-8773788c5b2c](https://uxdesign.cc/an-in-depth-look-into-good-text-blog-layouts-8773788c5b2c)  
> 17. Mobile-first design best practices | Adobe Express, [https://www.adobe.com/uk/express/learn/blog/designing-mobile-first-content](https://www.adobe.com/uk/express/learn/blog/designing-mobile-first-content)  
> 18. readability\_js \- Rust \- Docs.rs, [https://docs.rs/readability-js](https://docs.rs/readability-js)  
> 19. A standalone version of the readability lib \- GitHub, [https://github.com/mozilla/readability](https://github.com/mozilla/readability)  
> 20. Clean up HTML Content for Retrieval-Augmented Generation with Readability.js \- Phil Nash, [https://philna.sh/blog/2025/01/09/html-content-retrieval-augmented-generation-readability-js/](https://philna.sh/blog/2025/01/09/html-content-retrieval-augmented-generation-readability-js/)  
> 21. readability-js \- crates.io: Rust Package Registry, [https://crates.io/crates/readability-js](https://crates.io/crates/readability-js)  
> 22. How To Create Your Own Custom JS Snippet For Screaming Frog \- USEO, [https://useo.es/create-custom-js-screaming-frog/](https://useo.es/create-custom-js-screaming-frog/)  
> 23. (PDF) The Impact of Web Browser Reader Views on Reading Speed and User Experience, [https://www.researchgate.net/publication/332745070\_The\_Impact\_of\_Web\_Browser\_Reader\_Views\_on\_Reading\_Speed\_and\_User\_Experience](https://www.researchgate.net/publication/332745070_The_Impact_of_Web_Browser_Reader_Views_on_Reading_Speed_and_User_Experience)  
> 24. What algorithm does Readability use for extracting text from URLs? \- Stack Overflow, [https://stackoverflow.com/questions/3652657/what-algorithm-does-readability-use-for-extracting-text-from-urls](https://stackoverflow.com/questions/3652657/what-algorithm-does-readability-use-for-extracting-text-from-urls)  
> 25. Creating a 'Book' Like Web Page \- Google Groups, [https://groups.google.com/g/angular/c/6B2lGoSWjz4](https://groups.google.com/g/angular/c/6B2lGoSWjz4)  
> 26. iBooks-like Layout with Light CSS/JS, [https://css-tricks.com/ibooks-like-layout-light-cssjs/](https://css-tricks.com/ibooks-like-layout-light-cssjs/)  
> 27. Scroll Snapping with CSS Snap Points \- WebKit, [https://webkit.org/blog/4017/scroll-snapping-with-css-snap-points/](https://webkit.org/blog/4017/scroll-snapping-with-css-snap-points/)  
> 28. Practical CSS Scroll Snapping, [https://css-tricks.com/practical-css-scroll-snapping/](https://css-tricks.com/practical-css-scroll-snapping/)  
> 29. Mastering CSS Scroll Snap: Smooth Vertical and Horizontal Experiences Without JavaScript, [https://medium.com/@canozcannn/mastering-css-scroll-snap-smooth-vertical-and-horizontal-experiences-without-javascript-4cd8c03285e7](https://medium.com/@canozcannn/mastering-css-scroll-snap-smooth-vertical-and-horizontal-experiences-without-javascript-4cd8c03285e7)  
> 30. scroll-snap-type CSS property \- MDN Web Docs, [https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-snap-type](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-snap-type)  
> 31. CSS scroll snap \- MDN Web Docs, [https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll\_snap](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap)  
> 32. Dark Reader – Beautiful Dark Mode for any Website \- WordPress, [https://fr.wordpress.org/plugins/dark-reader/](https://fr.wordpress.org/plugins/dark-reader/)  
> 33. Firefox Reader View for clutter-free web pages \- Mozilla Support, [https://support.mozilla.org/en-US/kb/firefox-reader-view-clutter-free-web-pages](https://support.mozilla.org/en-US/kb/firefox-reader-view-clutter-free-web-pages)  
> 34. sepia() CSS function \- MDN Web Docs, [https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/filter-function/sepia](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/filter-function/sepia)  
> 35. Sepia theme (desktop and mobile app) \#8504 \- GitHub, [https://github.com/wallabag/wallabag/discussions/8504](https://github.com/wallabag/wallabag/discussions/8504)  
> 36. sepia() \- CSS-Tricks, [https://css-tricks.com/almanac/functions/s/sepia/](https://css-tricks.com/almanac/functions/s/sepia/)  
> 37. Sepia \- Tailwind CSS, [https://v3.tailwindcss.com/docs/sepia](https://v3.tailwindcss.com/docs/sepia)  
> 38. Implement Dark mode on your website \- DEV Community, [https://dev.to/ajaykumbhare/implement-dark-mode-on-your-website-3ohd](https://dev.to/ajaykumbhare/implement-dark-mode-on-your-website-3ohd)  
> 39. Dark Reader Ltd \- Chrome Web Store, [https://chromewebstore.google.com/publisher/dark-reader-ltd/u98cf52c4498e6ec420afdeb6bfdb56db](https://chromewebstore.google.com/publisher/dark-reader-ltd/u98cf52c4498e6ec420afdeb6bfdb56db)  
> 40. A custom element that allows you to easily put a Dark Mode toggle or switch on your site \- GitHub, [https://github.com/GoogleChromeLabs/dark-mode-toggle](https://github.com/GoogleChromeLabs/dark-mode-toggle)  
> 41. Wake Lock API: Browser Support, Features, Use Cases | TestMu AI (Formerly LambdaTest), [https://www.testmuai.com/learning-hub/wake-lock-api-browser-support/](https://www.testmuai.com/learning-hub/wake-lock-api-browser-support/)  
> 42. The Screen Wake Lock API \- DEV Community, [https://dev.to/mikeesto/the-screen-wake-lock-api-51hp](https://dev.to/mikeesto/the-screen-wake-lock-api-51hp)  
> 43. Screen Wake Lock API \- W3C, [https://www.w3.org/TR/screen-wake-lock/](https://www.w3.org/TR/screen-wake-lock/)  
> 44. Staying Alive: The Screen Wake Lock API \- DEV Community, [https://dev.to/madsstoumann/staying-alive-the-screen-wake-lock-api-31fh](https://dev.to/madsstoumann/staying-alive-the-screen-wake-lock-api-31fh)  
> 45. How to implement the Screen Wake Lock API in JavaScript \- ThatSoftwareDude.com, [https://www.thatsoftwaredude.com/content/13886/how-to-implement-the-screen-wake-lock-api-in-javascript](https://www.thatsoftwaredude.com/content/13886/how-to-implement-the-screen-wake-lock-api-in-javascript)  
> 46. WakeLockSentinel \- Web APIs | MDN, [https://developer.mozilla.org/en-US/docs/Web/API/WakeLockSentinel](https://developer.mozilla.org/en-US/docs/Web/API/WakeLockSentinel)  
> 47. useWakeLock | VueUse, [https://v7-7-1.vueuse.org/core/usewakelock/](https://v7-7-1.vueuse.org/core/usewakelock/)  
> 48. React hook to handle WakeLock (keep screen awake) \- Gist \- GitHub, [https://gist.github.com/KirianCaumes/de3ba93dd3091577a4308d4c2d4cf4ac](https://gist.github.com/KirianCaumes/de3ba93dd3091577a4308d4c2d4cf4ac)  
> 49. bulb: A React hook for the Screen Wake Lock API. Can be used to prevent a device's screen from turning off. \- GitHub, [https://github.com/mikeesto/use-wake-lock](https://github.com/mikeesto/use-wake-lock)  
> 50. react-screen-wake-lock \- NPM, [https://www.npmjs.com/package/react-screen-wake-lock](https://www.npmjs.com/package/react-screen-wake-lock)  
> 51. Building Immersive Web Apps in React: Fullscreen, Wake Lock, and Notifications \- Medium, [https://medium.com/@wul55267/building-immersive-web-apps-in-react-fullscreen-wake-lock-and-notifications-a8134c0ec11c](https://medium.com/@wul55267/building-immersive-web-apps-in-react-fullscreen-wake-lock-and-notifications-a8134c0ec11c)  
> 52. epub-js library \- GitHub Pages, [https://intity.github.io/epub-js/](https://intity.github.io/epub-js/)  
> 53. Building an EPUB Viewer in One Night with Claude Code \- Grizzly Peak Software, [https://www.grizzlypeaksoftware.com/articles/p/building-an-epub-viewer-in-one-night-with-claude-code-AMr8Pe](https://www.grizzlypeaksoftware.com/articles/p/building-an-epub-viewer-in-one-night-with-claude-code-AMr8Pe)  
> 54. epubjs \- UNPKG, [https://app.unpkg.com/epubjs@0.2.11/files/README.md](https://app.unpkg.com/epubjs@0.2.11/files/README.md)  
> 55. futurepress/epub.js: Enhanced eBooks in the browser. \- GitHub, [https://github.com/futurepress/epub.js/](https://github.com/futurepress/epub.js/)  
> 56. Setting up epub.js \- Stack Overflow, [https://stackoverflow.com/questions/52352962/setting-up-epub-js](https://stackoverflow.com/questions/52352962/setting-up-epub-js)  
> 57. Fixxate: I built a distraction-free speed-reading app for the Infinite Web | by Ankit Sharma, [https://medium.com/@ankitsharma61016/fixxate-i-built-a-distraction-free-speed-reading-app-for-the-infinite-web-1b877ccdc37e](https://medium.com/@ankitsharma61016/fixxate-i-built-a-distraction-free-speed-reading-app-for-the-infinite-web-1b877ccdc37e)