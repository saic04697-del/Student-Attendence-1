fetch("/students")
    .then(response => response.json())
    .then(data => {
        const list = document.getElementById("studentList");

        data.forEach(student => {
            const li = document.createElement("li");
            li.textContent = `${student.id} - ${student.name}`;
            list.appendChild(li);
        });
    });