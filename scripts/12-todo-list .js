'use strict'

const todoList = [{
  name: 'Make dinner',
  dueDate: '2024-12-08'
},
{
  name: 'wash dishes',
  dueDate: '2024-12-08'

}];

renderTodoList();

function renderTodoList() {
  let todoListHTML = '';

  todoList.forEach((todoObject, index) => {

    const { name, dueDate } = todoObject;

    const html = `
    <div>${name}</div>
    <div>${dueDate}</div>
    <button class="delete-todo-button js-delete-todo-button">Delete</button>
  `;
    todoListHTML += html;
  });

  document.querySelector('.js-todo-list')
    .innerHTML = todoListHTML;


  //QUERYSELECTORALL gives me all the element that have the class name
  document.querySelectorAll('.js-delete-todo-button')
    .forEach((deleteButton, index) => {
      deleteButton.addEventListener('click', () => {
        todoList.splice(index, 1);
        renderTodoList();
      });
    });

}

document.querySelector('.js-add-button')
  .addEventListener('click', () => {
    addTodo();
  });


function addTodo() {
  const inputElement = document.querySelector('.js-name-input');
  /*inputElement.value represent the text in d box*/
  const name = inputElement.value;

  const dateInputElement = document.querySelector('.js-due-date-input');

  const dueDate = dateInputElement.value;
  todoList.push({
    name,
    dueDate
  });


  /* Resetting my textbox */
  inputElement.value = '';

  renderTodoList();
}