class HomePage {
  title = 'Home | Hello World App';
  viewUrl = 'home/home';

  container = $element('container');
	textInput = $element('textinput');
	text = $element('text');

	init() {
		console.log('Hello World!');
		this.container = Sew.elements.get('container');
	}

	changeColor(color) {
		this.container.classList.forEach((element) => {
			this.container.classList.remove(element);
		});
		this.container.classList.add('sew-container');
		this.container.classList.add('sew-color-' + color);
	}
	changeText() {
		let reversedText = this.textInput.children[0].value.split('').reverse().join('');

		Sew.elements.fill(this.text, reversedText, true, null);
	}
}

const _swComponent = HomePage;
