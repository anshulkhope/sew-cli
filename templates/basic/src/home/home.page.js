class HomePage {
    title = 'Home | Hello World App';
    viewUrl = 'src/home/home';

    container = Sew.elements.get('container');
	textInput = Sew.elements.get('textinput');
	text = Sew.elements.get('text');

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
