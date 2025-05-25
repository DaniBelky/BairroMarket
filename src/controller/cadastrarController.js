
document.getElementById('formCadastro').addEventListener('submit', async function (e) {
    e.preventDefault(); 

    const name = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('Senha').value;
    const confirmPassword = document.getElementById('ConfirmSenha').value;
    const birthdate = document.getElementById('birthdate').value;
    const sexo = document.querySelector('input[name="sexo"]:checked')?.value;

    if (!sexo) {
        alert("Selecione o sexo.");
        return;
    }

    if (password !== confirmPassword) {
        alert("As senhas não coincidem!");
        return;
    }

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                email,
                password,
                dt_nascimento: birthdate,
                sexo
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Usuário cadastrado com sucesso!");
            document.getElementById('formCadastro').reset();
        } else {
            alert(result.error || "Erro ao cadastrar usuário.");
        }

    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro na requisição.");
    }
});
