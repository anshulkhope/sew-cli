/**
 * Sew v0.0.4
 * Copyright (c) 2021 - Anshul Khope, Sew Company
 * 
 * Sew is JavaScript library for easier handling of UI Components.
 * It is completely based on the idea of Components. Everything you see is a component;
 * even the app itself.
 * 
 * Components can be decorated differently to get results such as buttons,
 * checkboxes, text inputs, links, cards, paragraphs, navbar, etc. Sew comes by default
 * with a CSS that you can use right away (no link-imports needed, the library
 * imports it by default!).
 * 
 * :PS, You can even make the library import a custom stylesheet.
 * 
 * In short:
 * Sew = Making WebGUIs easier!
 * 
 */


/** 
 * The main ***Sew*** Object. Contains sub-classes for UI-elements, router and
 * other functions.
 */

const Sew = {

	/**
	 * @name addStyleRefs
	 * @description Add a reference to a CSS stylesheet.
	 * 
	 * @param  {String} href The URL/path to the stylesheet.
	 */
	addStyleRefs: (href) => {
		const e = Sew.elements.create('link', document.head, null, false);
		e.setAttribute('href', href);
		e.setAttribute('rel', 'stylesheet');

		e.onload = () => {
			console.log('Loaded Styles! [' + href + ']');
		}
	},

	/**
	 * @name showQuickToast
	 * @description Shows a little toast dialog at the right-bottom of the body. The toast has a
	 * title and a body message.
	 * 
	 * @param  {String} title Title of the toast.
	 * @param  {String} message Message shown in the body of the toast.
	 */
	showQuickToast: (title, message) => {
		const e = Sew.elements.create('sew-toast', document.body, '', false);
		e.classList.add('sew-toast');
		e.classList.add('show');


		const head = Sew.elements.create('sew-toast-head', e, '', false);
		head.classList.add('sew-toast-head');
		Sew.elements.create('sew-toast-title', head, title, false)
			.classList.add('sew-toast-title');
		const body = Sew.elements.create('sew-toast-body', e, message, false);
		body.classList.add('sew-toast-body');


		setTimeout(() => {
			e.remove();
		}, 3000);
	},
	/**
	 * @name showQuickInfo
	 * @description Very similar to toast. Shows a box with some info at left-bottom of the page.
	 * Especially links of sew-Link components.
	 * 
	 * @param  {String} infomsg The message shown in the info.
	 */
	showQuickInfo: (infomsg) => {

		if (document.querySelector('sew-info'))
			document.querySelector('sew-info').remove();

		const e = Sew.elements.create('sew-info', document.body, infomsg, false);
		e.classList.add('sew-info');
		e.classList.add('show');
		e.classList.add('align-bottom');

		setTimeout(() => {
			e.remove();
		}, 1500);
	},

	loadComponent: async (component) => {
		const res = await fetch(Sew.router.source + component);
		const componentClass = res.text();
		return (new Function((await componentClass).toString() + 'return _swComponent;'))();
	},

	/**
	 * This object is used to change the user's controls to the DOM.
	 */
	controls: {

		/**
		 * If the controls are allowed to be disabled. If set to false all controls will
		 * be enabled.
		 * @type boolean
		 * @default true
		 */
		shouldDisablecontrols: true,

		/**
		 * Disable a particular control (`inspect`, `contextmenu` , `view-source`, `select`)
		 * @param {String} control The control to disable.
		 * @param {String} msgOnCtrlBreak **TODO** 
		 */
		disable: (control, msgOnCtrlBreak) => {

			if (control === 'inspect' && Sew.controls.shouldDisablecontrols) {
				document.onkeydown = (e) => {
					if (e.keyCode == 123) {
						Sew.showQuickToast('Error', 'Inspect Element is disabled.');
						return false;
					}
					if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
						Sew.showQuickToast('Error', 'Inspect Element is disabled.');
						return false;
					}
					if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
						Sew.showQuickToast('Error', 'Inspect Element is disabled.');
						return false;
					}
					if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
						Sew.showQuickToast('Error', 'Inspect Element is disabled.');
						return false;
					}
				}
			}
			else if (control === 'view-source' && Sew.controls.shouldDisablecontrols) {
				document.onkeydown = (e) => {
					if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
						Sew.showQuickToast('Error', 'View Source is disabled.');
						return false;
					}
				}
			}
			if (control === 'contextmenu' && Sew.controls.shouldDisablecontrols) {
				document.oncontextmenu = function (e) {
					Sew.showQuickToast('Error', 'Right Click is disabled.');
					return false;
				}
			}
			if (control === 'select' && Sew.controls.shouldDisablecontrols) {
				document.onselectstart = (ev) => {
					ev.preventDefault();
				}
				Sew.app.rootElement.classList.add('sew-cursor-default');
				return false;
			}
		}
	},

	/**
	 * The router. Handles routing for all paths defined by user.
	 */
	router: {

		/**
		 * All the page filenames to their contents. Used by the router to just put the
		 * required page contents into the app RootElement.
		 * @type Object
		 * @default {}
		 */
		pages: {},

		/**
		 * The root or base path from which the routes/routing would work.
		 * @type String
		 * @default '/'
		 */
		rootPath: '/',

		source: '/src/',

		/**
		 * Returns a page name.
		 * @param {String} page The page name.
		 * @returns `String`
		 */
		getPageName: (page) => {
			const _page = page.toLowerCase();
			return _page;
		},

		/**
		 * Start the router. Also loads all pages asynchronously to provide blazing fast output.
		 */
		start: async (app) => {
			 
			Object.values(app.pages).forEach(page => {
				Sew.router.pages[page.name] = page.view;
			});

			document.head.querySelector('base').href = Sew.router.rootPath;
			
			Sew.app.rootElement.setAttribute('route', 'default');
			Sew.router.loading = false;
			
			//if (localStorage.getItem('sw_last_route') !== null) {
				//Sew.router.navigate(localStorage.getItem('sw_last_route'));
				//	console.warn('SW_Warning: Load previous page after unload, [' + localStorage.getItem('sw_last_route') + ']');
				//} else
			if (location.hash !== '') {
				Sew.router.navigate(location.hash.substring(1).replace('/', ''));
			} else {
				Sew.router.navigate(Object.keys(app.pages)[0]);
			}
			
			Sew.router.initRefs();
		},


		initRefs: () => {
			document.querySelectorAll('[ref]').forEach(element => {
				window.elementRefs = {};
				window.elementRefs[element.getAttribute('ref')] = element;
				console.log(elementRefs);
			});
		},
		/**
		 * Navigate to a page.
		 * @param {String} page The page name.
		 */
		navigate: async (page) => {
			let pageContent;
			await Sew.app.app.pages[page].then(c => {
				let component = new c();

				location.hash = '#/' + page;

				if (component.view !== undefined && component.viewUrl === undefined) {
					Sew.app.rootElement.innerHTML = component.view;
				} else if (component.view === undefined && component.viewUrl !== undefined) {
					Sew.router.loadPage(Sew.router.rootPath + component.viewUrl + '.sw.html')
						.then((data) => {
							Sew.app.rootElement.innerHTML = data;
						});
				}
				
				document.title = component.title;
				
				Sew.app.rootElement.setAttribute('route', page);
				
				component.init();
				Sew.router.initRefs();

				//localStorage.setItem('sw_last_route', _page);
			});
		},

		/**
		 * Load a page to the app.RootElement. Needs the absolute url to the HTML file.
		 * @param {String} page The page to load.
		 * @returns String
		 */
		loadPage: async (page) => {
			const res = await fetch(page);
			const html = await res.text();
			return html;
		},

		/**
		 * Set the base url or root path to which the router can refer when navigating.
		 * @param {String} root The path.
		 */
		setRoot: (root) => {
			Sew.router.rootPath = root;
		},

		/**
		 * Set the source path.
		 * @param {String} source The source.
		 */
		setSource: (sourcePath) => {
			Sew.router.source = sourcePath;
		}
	},

	/**
	 * The app Class.
	 * Contains a few related functions and variables to the router and the app.
	 */
	app: {
		/**
		 * Initialize the ***Sew*** app's DOM view.
		 * 
		 * @param  {class} app The app class.
		 */
		init: (app) => {

			Sew.app.app = app;

			Sew.router.start(app).then(() => {
				//app.start()
			
				console.log('Loading...');
				console.log('Welcome to Sew 0.0.4');
	
				Sew.app.log('Loading components...');
				Sew.elements.UI.init();
			
				//location.pathname = location.hash;

				Sew.app.setTitle(app.title);

				if (app.appPreferences !== undefined && app.appPreferences.icon !== undefined) {
					const faviconRef = Sew.elements.create('link', document.head, null, false);
					faviconRef.setAttribute('href', app.appPreferences.icon);
					faviconRef.setAttribute('rel', 'icon');
				}

				Sew.app.rootElement.setAttribute('lang', 'en');
				Sew.app.rootElement.setAttribute('dir', 'ltr');
				Sew.app.rootElement.classList.add('sew-theme-' + Sew.app.rootElement.getAttribute('theme'));
				Sew.app.rootElement.setAttribute('sw-extended-component-id', '_sew-appRoot');

				Sew.addStyleRefs('internal/framework/Sew.css');

				if (Sew.app.rootElement.getAttribute('theme') === 'dark') {
					const meta = Sew.elements.create('meta', document.head, null, false);
					meta.setAttribute('name', 'color-scheme');
					meta.setAttribute('content', 'dark');
				}

				window.onhashchange = () => {
					Sew.router.navigate(location.hash.substring(1).replace('/', ''));
				}

			});
		},

		setTitle(title) {
			document.title = title;
		},

		/**
		 * The app's root.
		 */
		rootElement: document.querySelector('sew-app'),

		/**
		 * Log a message to the console.
		 * @param  {String} msg 
		 */
		log: (msg) => {
			let colorStyleText = 'color:green;font-size:.8rem;font-weight:600';
			console.log('%c[app] ' + msg, colorStyleText);
		},

		/**
		 * Throw an error.
		 * @param  {String} msg 
		 */
		throwError: (msg) => {
			throw new Error('Internal app Error -> ' + msg);
		},

		/**
		 * Get the currently routed-to page displayed in the `rootElement`.
		 */
		getActivePage: () => {
			return Sew.app.rootElement.getAttribute('route');
		},

		/**
		 * @type {{pages:{}}}
		 */
		app: null,

	},

	elements: {
	
		UI: {
			/**
			 * Define all the custom Sew UI elements.
			 */
			init: () => {
				customElements.define('sew-button', Sew.elements.UI.Button);
				customElements.define('sew-text', Sew.elements.UI.Text);
				customElements.define('sew-container', Sew.elements.UI.Container);
				customElements.define('sew-navbar', Sew.elements.UI.Navbar);
				customElements.define('sew-link', Sew.elements.UI.Link);
				customElements.define('sew-card', Sew.elements.UI.Card);
				customElements.define('sew-modal', Sew.elements.UI.Modal);
				customElements.define('sew-page', Sew.elements.UI.Page);
				customElements.define('sew-span', Sew.elements.UI.Span);
				customElements.define('sew-img', Sew.elements.UI.Img);
				customElements.define('sew-input', Sew.elements.UI.Input);
			},


			/**
			 * 
			 * Class implementations for Sew's UI objects.
			 * 
			 */

			/**
			 * Define simple text with a few tweaks.
			 */
			Text: class extends HTMLElement {
				constructor() {
					super();

					if (this.hasAttribute('paragraph')) {
						this.classList.add('sew-paragraph');
					}

					if (this.hasAttribute('jumbotron')) {
						this.classList.add('sew-jumbo-text');
					}

					if (this.hasAttribute('color')) {
						this.classList.add('sew-text-' + this.getAttribute('color'));
					} else {
						this.classList.add('sew-text-default');
					}
				}
			},

			/**
			 * Define a button with color, outline and some more attributes.
			 */
			Button: class extends HTMLElement {
				constructor() {
					super();

					this.classList.add('sew-button');
					this.classList.add('sew-mat-item');
					if (this.hasAttribute('color'))
						this.classList.add('sew-button-colored');
					this.classList.add('sew-color-' + this.getAttribute('color'));
					this.removeAttribute('color');
					this.setAttribute('sw-extended-component-id', '_sewButton');

					if (this.hasAttribute('clicked')) {
						this.setAttribute('onclick', this.getAttribute('clicked'));
						this.removeAttribute('clicked');
					}

					if (this.hasAttribute('outline') && !this.hasAttribute('color')) {
						this.classList.add('sew-outline-color-' + this.getAttribute('outline'));
					}

					this.onmousedown = () => {
						if (this.classList.contains('sew-button-hovered')) {
							this.classList.remove('sew-button-hovered');
						}
					};
					this.onclick = () => {
						if (this.hasAttribute('route')) {
							Sew.router.navigate(this.getAttribute('route'));
						}
						if (this.hasAttribute('exec')) {
							const execute = new Function(`
							Sew.app.app.pages.${Sew.app.getActivePage()}.then(component => {
								new component().${this.getAttribute('exec')}
							});
							`);
							execute();
						}
					}
				}
			},

			/**
			 * A link, basically associated with a text element.
			 */
			Link: class extends HTMLElement {
				constructor() {
					super();

					this.classList.add('sew-link');
					this.classList.add('sew-mat-item');

					this.onclick = () => {
						if (this.hasAttribute('route')) {
							Sew.router.navigate(this.getAttribute('route'));
						}
						if (this.hasAttribute('sw-address')) {
							window.open(this.getAttribute('sw-address'), this.getAttribute('target'));
						}
					};

					
					if (this.hasAttribute('color')) {
						this.style.color = this.getAttribute('color');
					}
					
					if (this.hasAttribute('navelement')) {
						this.classList.add('sew-nav-element');
						this.onclick = () => {
							if (this.hasAttribute('route')) {
								Sew.router.navigate(this.getAttribute('route'));
							}
							if (this.hasAttribute('sw-address')) {
								window.open(this.getAttribute('sw-address'), this.getAttribute('target'));
							}
							if (/(android)/i.test(navigator.userAgent)) {
								document.getElementById('nav-overlay').remove();
								document.getelementsByClassName('sew-nav-links-float')[0].classList.remove('sew-nav-links-float');
							}
						}
					}

					this.setAttribute('sw-extended-component-id', '_sewLink');
				}
			},


			/**
			 * A simple container element, provided with some margin spacings.
			 */
			Container: class extends HTMLElement {
				constructor() {
					super();

					if (this.hasAttribute('small')) {
						this.classList.add('sew-container-small');
					}
					else if (this.hasAttribute('card-deck')) {
						this.classList.add('sew-card-deck');
					}
					else {
						this.classList.add('sew-container');
					}

					if (this.hasAttribute('alignment')) {
						this.classList.add('align-' + this.getAttribute('alignment'));
					}

					if (this.hasAttribute('jumbotron-wrapper')) {
						this.classList.add('sew-jumbotron-wrapper');
					}

					this.setAttribute('sw-extended-component-id', '_sewContainerDiv');
				}
			},


			/**
			 * Creates a navbar with customizable colors. Also can be a fixed-top navbar.
			 */
			Navbar: class extends HTMLElement {
				constructor() {
					super();

					this.classList.add('sew-nav');
					this.classList.add('sew-color-' + this.getAttribute('color'));

					if (this.hasAttribute('fixed')) {
						this.classList.add('sew-nav-fixed');
						Sew.app.rootElement.classList.add('sew-body-fixednav-pads');
					}

					this.setAttribute('sw-extended-component-id', '_sewNavbar');


					// if (/(android)/i.test(navigator.userAgent)) {
					const e = Sew.elements.create('sew-button-unused', this.querySelector('[navBody]'), '', false);
					e.classList.add('sew-button');
					e.classList.add('sew-color-danger');
					e.classList.add('sew-mat-item');
					e.classList.add('sew-mobile-nav-toggle');

					e.onclick = () => {
						this.querySelector('ul[navList]').toggleAttribute('navVisible');
					}

					this.classList.add('sew-nav-mobile');
				}
			},

			/**
			 * A classic Card element.
			 */
			Card: class extends HTMLElement {
				constructor() {
					super();

					this.classList.add('sew-card');

					this.querySelector('sew-card-head').classList.add('sew-card-head');
					this.querySelector('sew-card-body').classList.add('sew-card-body');

					this.querySelector('sew-card-title').classList.add('sew-card-title');

					this.setAttribute('sw-extended-component-id', '_sewCard');
				}
			},

			/**
			 * A Modal.
			 */
			Modal: class extends HTMLElement {
				constructor() {
					super();

					this.classList.add('sew-modal');
					this.classList.add('sew-modal-hidden');

					this.querySelector('sew-modal-body').classList.add('sew-modal-body');
					const wrapper = this.querySelector('sew-modal-close');
					wrapper.classList.add('sew-modal-close-wrapper');

					Sew.elements.create('sew-modal-close-button', wrapper, '&nbsp;&Cross;&nbsp;', false)
						.classList.add('sew-modal-close');

					if (this.querySelector('[modal-close]') !== null) {
						this.querySelector('[modal-close]').addEventListener('click', () => {
							Sew.elements.disable(Sew.elements.get(`${this.getAttribute('name')}`), true);
						});
					}


					this.querySelector('sew-modal-title').classList.add('sew-modal-title');

					this.querySelector('sew-modal-buttons').classList.add('sew-modal-buttons');

					this.querySelector('sew-modal-close-button').addEventListener('click', () => {
						Sew.elements.disable(Sew.elements.get(`${this.name}`), true);
					});

					this.setAttribute('sw-extended-component-id', '_sewModal');
				}
			},

			/**
			 * Insert an iframe-like page into the document (not an iframe).
			 */
			Page: class extends HTMLElement {
				constructor() {
					super();

					this.loadInner();

					this.setAttribute('sw-extended-component-id', '_sewEmbedPage');
				}
				async loadInner() {
					await Sew.app.app.pages[this.getAttribute('route')].then(c => {
						let component = new c();

						Sew.router.loadPage(Sew.router.rootPath + component.viewUrl + '.sw.html')
							.then((data) => {
								this.innerHTML = data;
							});
					});
				}
			},

			/**
			 * A plain element. If you just want a simple element on which you can use
			 * sw- triggers, use this one!
			 */
			Span: class extends HTMLElement {
				constructor() {
					super();

					let old = this.getAttribute('sw-visible');

					this.setAttribute('sw-extended-component-id', '_Plain');
					const _this = this;

					if (this.hasAttribute('sw-visible')) {

						const checkFunc = new Function('return(' + this.getAttribute('sw-visible') + ');');
						
						if (checkFunc() === true) {
							this.style.display = '';
						} else {
							this.style.display = 'none';
						}
						var observer = new MutationObserver(function(mutations) {
							mutations.forEach(function(mutation) {
							if (mutation.type === 'attributes') {
								const checkFunc = new Function('return(' + _this.getAttribute('sw-visible') + ');');
								if (checkFunc() === true) {
									_this.style.display = '';
								} else {
									_this.style.display = 'none';
								}
							}
							});
						});

						observer.observe(this, {
							attributes: true,
						});
					}

					if (this.hasAttribute('sw-if')) {

						const checkFunc = new Function('return(' + this.getAttribute('sw-if') + ');');
						
						if (checkFunc() === true) {
							this.style.display = '';
						} else {
							this.style.display = 'none';
						}
						var observer = new MutationObserver(function(mutations) {
							mutations.forEach(function(mutation) {
							if (mutation.type === 'attributes') {
								const checkFunc = new Function('return(' + _this.getAttribute('sw-if') + ');');
								if (new Boolean(_this.getAttribute('sw-if'))) {
									_this.style.display = '';
								} else {
									_this.style.display = 'none';
								}
							}
							});
						});

						observer.observe(this, {
							attributes: true,
						});
					}
				}
			},

			Img: class extends HTMLElement {
				constructor() {
					super();
					
					let childImg;

					this.classList.add('sew-img');
					
					const spinner = Sew.elements.create('span', this, null, false);
					spinner.classList.add('sew-spinner');
					
					if (this.hasAttribute('src')) {
						childImg = Sew.elements.create('img', this, null, false);
						childImg.setAttribute('src', this.getAttribute('src'));
						childImg.setAttribute('alt', this.getAttribute('alt'));
						
						childImg.onload = () => {
							spinner.remove();
						}
						
						this.removeAttribute('src');
						this.removeAttribute('alt');
					}
					
					if (this.hasAttribute('size')) {
						childImg.style.width = this.getAttribute('size');
						this.removeAttribute('size');
					}
					
					if (this.hasAttribute('pads')) {
						childImg.style.padding = this.getAttribute('pads');
						this.removeAttribute('pads');
					}

					if (this.hasAttribute('drag')) {
						if (this.getAttribute('drag') === 'false')
							childImg.classList.add('sew-img-nodrag');
						this.removeAttribute('drag');
					}

					if (this.hasAttribute('sw-class')) {
						childImg.classList.add(this.getAttribute('sw-class'));
						this.removeAttribute('sw-class');
					}

					childImg.setAttribute('sw-extended-component-id',
						'_sewGenerated');
					this.setAttribute('sw-extended-component-id', '_sewImage');
				}
			},
			Input: class extends HTMLElement {
				constructor() {
					super();

					const childInput = Sew.elements.create('input', this, null, false);
					if (this.hasAttribute('hint')) {
						childInput.setAttribute('placeholder', this.getAttribute('hint'));
						this.removeAttribute('hint');
					}
					if (this.hasAttribute('name')) {
						childInput.setAttribute('name', this.getAttribute('name'));
					}
					if (this.hasAttribute('type')) {
						childInput.setAttribute('type', this.getAttribute('type'));
					}

					if (this.hasAttribute('*change')) {
						Sew.app.app.pages[Sew.app.getActivePage()].then(c => {
							let component = new c();
							this.addEventListener('input', () => {
								const fn = new Function(`let component = ${c.toString()};new component().${this.getAttribute('*change')}();`);
								fn();
							})
						})
					}
				}
			}
		},

		
		/**
		 * Create/append a new element in the DOM Body.
		 * 
		 * @param  {String} name The tag name of the element
		 * @param  {HTMLElement} parent The parent element to this element.
		 * @param  {String} contents The HTML contents of the given element.
		 * @param  {Boolean} emptyParent If the parent's text should be emptied while appending
		 */
		create: (name, parent, contents, emptyParent) => {
			const e = document.createElement(name);

			e.innerHTML = contents;
			if (emptyParent) {
				parent.innerText = '';
			}

			parent.append(e);

			return e;
		},

		/**
		 * Enables an element.
		 * 
		 * @param  {HTMLElement} element The element.
		 * @param  {Boolean} isModal If the element is a Modal Component.
		 */
		enable: (element, isModal) => {
			if (isModal) {
				element.classList.add('sew-modal-shown');
				element.classList.remove('sew-modal-hidden');
			} else {
				element.classList.remove('sew-nodisplay');
				element.classList.add('sew-visible');
			}
		},

		/**
		 * Disables an element.
		 * 
		 * @param  {HTMLElement} element The element.
		 * @param  {Boolean} isModal If the element is a Modal Component.
		 */
		disable: (element, isModal) => {
			if (isModal) {
				element.classList.remove('sew-modal-shown');
				element.classList.add('sew-modal-start-hide');
				setTimeout(() => {
					element.classList.remove('sew-modal-start-hide');
					element.classList.add('sew-modal-hidden');
				}, 550);
			} else {
				element.classList.add('sew-nodisplay');
				if (element.classList.contains('sew-visible')) {
					element.classList.remove('sew-visible');
				}
			}
		},

		/**
		 * Append text/html data to an element.
		 * 
		 * @param  {HTMLElement} element The parent element of the data.
		 * @param  {String} data The data to fill.
		 * @param  {boolean} clearOld Should clear the old data in the parent element before filling.
		 * @param  {HTMLInputElement} fromInput 
		 */
		fill: (element, data, clearOld, fromInput) => {
			let innerFill;
			if (!clearOld) {
				if (fromInput !== null) {
					const oldInnerHtml = element.innerHTML;
					innerFill = oldInnerHtml + fromInput.children[0].value;
				} else {
					const oldInnerHtml = element.innerHTML;
					innerFill = oldInnerHtml + data;
				}
			} else {
				if (fromInput !== null) {
					innerFill = fromInput.children[0].value;
				} else {
					innerFill = data;
				}
			}

			element.innerHTML = innerFill;
		},

		/**
		 * Get the HTMLElement by its selector.
		 * 
		 * @param  {String} name name.
		 */
		get: (name) => {
			return document.getElementsByName(name)[0];
		}
	},
}

/**
 * Thanks for peeking into the wonderous code of Sew :)
 */
