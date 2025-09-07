# Toastmasters Timer

A simple web-based timer for Toastmasters meetings. This tool tracks speaking times, provides visual cues, and records a log of speaker names and their final durations.

### Features

* **Real-time Timer:** Displays a live countdown in minutes and seconds.
* **Intuitive Visual Cues:** The background changes color to signal time milestones, helping speakers manage their pace.
    * **Green:** Minimum time met.
    * **Yellow:** Time is nearing the end.
    * **Red:** Maximum time has passed.
* **Speaker Tracking:** Allows you to input speaker names and records their final time upon stopping the timer.
* **Persistent Log:** Maintains a list of all speakers and their times for easy reference during the meeting.
* **Customizable Time Limits:** Easily adjust the Green, Yellow, and Red time limits to fit any speech type (e.g., Icebreaker, Table Topics, etc.).
* **Clean and Responsive UI:** Built with a minimalist design that works well on desktop and mobile browsers.

---

### How to Use It

1.  **Open the Website:** Simply visit the live site at [https://ld-shell.github.io/toastmasters-timer/](https://ld-shell.github.io/toastmasters-timer/).
2.  **Set Your Times:** Adjust the Green, Yellow, and Red time limits in seconds to match the speech requirements. The default settings are **1 minute for Green**, **1 minute and 30 seconds for Yellow**, and **2 minutes for Red** (overtime).
3.  **Enter Speaker Name:** Type the speaker's name into the input field.
4.  **Start the Timer:** Click the **Start** button to begin timing the speech. The background will change colors according to the limits you set.
5.  **Record the Time:** When the speaker finishes, click **Stop & Record**. The speaker's name and their final time will be added to the list below.
6.  **Next Speaker:** The timer will reset automatically, ready for the next speaker.

---

### Project Structure

The project is split into three clean files, following web development best practices for easy maintenance and scaling:

* **`index.html`:** The main HTML file that provides the page's structure and content.
* **`style.css`:** Contains all the CSS code for styling, colors, and layout. This is where the visual magic happens.
* **`script.js`:** The JavaScript file that handles all the timer logic, user interactions, and dynamic updates to the page.

---

### Contributing

Contributions are what make the open-source community so amazing. Any feedback, bug reports, or feature requests are welcome! Feel free to open an issue or submit a pull request.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.
