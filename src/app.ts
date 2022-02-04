//Project type
enum ProjectStatus {
    Active,
    Finished,
}

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ){}
}

//Project State Management with own custom type
type Listener = (item: Project[]) => void;


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

//Component base class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(
        templateId: string,
        hostElementId: string,
        insertAtStart: boolean,
        newElementId?: string
    ) {
        this.templateElement = document.getElementById(
            templateId
            )! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(this.templateElement.content, true);

    this.element = importedNode.firstElementChild as U;
    if(newElementId) {
        this.element.id = newElementId
    }
    this.attach(insertAtStart);
}
private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
    insertAtBeginning ? 'afterbegin':'beforeend',
    this.element
    )
}
abstract configure(): void;
abstract renderContent(): void;
}

//project state management
class ProjectState {
    private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {}

    static getInstance() {
        if (this.instance) {
            return this.instance
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    // addListener(listenerFn: Function) {
    //     this.listeners.push(listenerFn);
    // }

    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
    }

    addProject(title:string, description:string, numberOfPeople:number) {
        const newProject = new Project (
            Math.random().toString(),
            title,
            description,
            numberOfPeople,
            ProjectStatus.Active
        );

        this.projects.push(newProject);
        for(const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance();

class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: any[];

    constructor(private type: 'active' | 'finished') {
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;
        this.assignedProjects = [];
     
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`;

        projectState.addListener((projects: any[]) => {
            const relevantProjects = projects.filter((prj) => {
                if(this.type === 'active') {
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            });

            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
        this.attach();
        this.renderContent();
    }
    private renderProjects() {
        const listElements = document.getElementById(`${this.type}-project-list`
        )! as HTMLUListElement;
        listElements.innerHTML = '';
        for(const projectItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = projectItem.title;
            listElements.appendChild(listItem);
        }
    }

    private renderContent() {
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul')!.id=listId;
        this.element.querySelector('h2')!.textContent=this.type.toUpperCase() + 'PROJECTS';
    }

    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }
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
            projectState.addProject(title, description, people);
            // console.log(title, description, people);
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

const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
