//creating a re-usable validation functionality
interface Validtable {
    value: string | number;
    required?: boolean; //? makes this optional to fill in
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validtableInput: Validtable) {
    let isValid = true;
    if (validtableInput.required) {
        isValid = isValid && validtableInput.value.toString().trim().length !==0;
    }
    if(validtableInput.minLength != null && typeof validtableInput.value === 'string') {
        isValid = isValid && validtableInput.value.length >= validtableInput.minLength;
    }
    if(validtableInput.maxLength != null && typeof validtableInput.value === 'string') {
        isValid = isValid && validtableInput.value.length <= validtableInput.maxLength;
    }
    if(validtableInput.min != null && typeof validtableInput.value === 'number') {
        isValid = isValid && validtableInput.value >= validtableInput.min;
    }
    if(validtableInput.max != null && typeof validtableInput.value === 'number') {
        isValid = isValid && validtableInput.value <= validtableInput.max;
    }
    return isValid;
}

//decorator is a function, autobind decorator
//autobind is to automatically bind to "this" keyword

function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjDescriptor;
}

class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement; //holds a reference to the element where you want render the template content
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;
        
        const importedNode = document.importNode(this.templateElement.content,true);
            this.element = importedNode.firstElementChild as HTMLFormElement;

            this.element.id="user-input";
            this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
            this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
            this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;

            this.configure();
            this.attach();
    }

    //collect inputs from PMApp form
    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidtable: Validtable = {
            value:enteredTitle,
            required: true,
        };

        const descriptionValidtable: Validtable = {
            value:enteredDescription,
            required: true,
            minLength: 5,
        };

        const peopleValidtable: Validtable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 11,
        };

        if(
            !validate(titleValidtable) ||
            !validate(descriptionValidtable) ||
            !validate(peopleValidtable)
            // enteredTitle.trim().length === 0 || 
            // enteredDescription.trim().length === 0 || 
            // enteredPeople.trim().length === 0
            ) {
            alert('Invalid input');
            return;
        }
        else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }

    }

    private clearInput() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '',
        this.peopleInputElement.value = '';
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        // console.log(this.titleInputElement.value);
        // console.log(this.descriptionInputElement.value);
        const userInput = this.gatherUserInput();
        if(Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            console.log(title, description, people);
            this.clearInput();
        }
    }

    private configure() {
        //call bind here to reconfigure how this function is going to execute when it executes in the future
        //this.element.addEventListener('submit', this.submitHandler.bind(this));
        this.element.addEventListener('submit', this.submitHandler);
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

const prjInput = new ProjectInput();
