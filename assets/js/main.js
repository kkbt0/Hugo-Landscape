console.log(
    `%c Author %c 恐咖兵糖 %c`,
    'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
    'background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
    'background:transparent'
  )
console.log("恐咖兵糖的主页 https://www.ftls.xyz");

function switchTheme() {
    if (localStorage.theme === 'dark') {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    }
}

function loadButtonScript() {
    const switchBtn = document.getElementById("scheme-switch");
    switchBtn.addEventListener("click", function () {
        switchTheme()
    });

    // let settingBtn = document.getElementById("display-settings-switch");
    // settingBtn.addEventListener("click", function () {
    //     let settingPanel = document.getElementById("display-setting");
    //     settingPanel.classList.toggle("closed");
    // });

    let menuBtn = document.getElementById("nav-menu-switch");
    menuBtn.addEventListener("click", function () {
        let menuPanel = document.getElementById("nav-menu-panel");
        menuPanel.classList.toggle("closed");
    });
}

loadButtonScript();

// document.addEventListener('astro:after-swap', () => {
//     loadButtonScript();
// }, { once: false });

function setClickOutsideToClose(panel, ignores) {
	document.addEventListener("click", event => {
		let panelDom = document.getElementById(panel);
		let tDom = event.target;
		for (let ig of ignores) {
			let ie = document.getElementById(ig)
			if (ie == tDom || (ie?.contains(tDom))) {
				return;
			}
		}
		panelDom.classList.add("closed");
	});
}
setClickOutsideToClose("nav-menu-panel", ["nav-menu-panel", "nav-menu-switch"])

// setClickOutsideToClose("display-setting", ["display-setting", "display-settings-switch"])
// setClickOutsideToClose("search-panel", ["search-panel", "search-bar", "search-switch"])

function setHue(hue) {
    // localStorage.setItem('hue', String(hue))
    const r = document.querySelector(':root')
    if (!r) {
      return
    }
    r.style.setProperty('--hue', hue)
}
  

let hue = 250;  
setInterval(function () { 
    if (hue >= 360) {  
        hue = 0; 
      } else {  
        hue += 10;  
      }
      setHue(hue);
}, 1000);
  