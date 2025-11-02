import { Auth } from './auth.js';

Auth.protegerLogin();

const signupForm = document.querySelector('#signupForm')
signupForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    const name = document.querySelector('#name').value
    const email = document.querySelector('#email').value
    const password = document.querySelector('#password').value
    const tipo = document.querySelector('#tipo').value;
    const rfc = document.querySelector('#rfc').value;
    const phone = document.querySelector('#phone').value;

    const Users = JSON.parse(localStorage.getItem('users')) || []
    const isUserRegistered = Users.find(user => user.email === email || user.rfc === rfc)
    if(isUserRegistered){
        return alert('El usuario ya esta registado!')
    }
const newUser = {name: name, email: email, password: password, phone: phone, rfc: rfc, tipo: tipo};
    Users.push(newUser);
    localStorage.setItem('users', JSON.stringify(Users))
    alert('Registro Exitoso!')
    Auth.iniciarSesion(newUser);
    window.location.href = 'app/index.html';

})