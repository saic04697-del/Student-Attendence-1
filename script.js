const API = "http://localhost:3000";

async function addStudent() {
    const name = document.getElementById("name").value.trim();
    const attendance = document.getElementById("attendance").value;

    if (!name) {
        alert("Enter student name");
        return;
    }

    try {
        const res = await fetch(`${API}/students`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, attendance })
        });

        if (!res.ok) {
            throw new Error("Failed to add student");
        }

        document.getElementById("name").value = "";
        await loadStudents();
    } catch (err) {
        alert("Could not add student. Please try again.");
        console.error(err);
    }
}

async function loadStudents() {
    try {
        const res = await fetch(`${API}/students`);
        if (!res.ok) {
            throw new Error("Failed to load students");
        }

        const data = await res.json();
        const studentList = document.getElementById("studentList");

        studentList.innerHTML = "";

        data.forEach((student) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.attendance || "Present"}</td>
                <td>${student.attendance_percentage || "0.00"}%</td>
                <td>
                    <button onclick="editStudent(${student.id}, '${student.name}', '${student.attendance || "Present"}', '${student.attendance_percentage || "0.00"}')">Edit</button>
                    <button onclick="deleteStudent(${student.id})">Delete</button>
                </td>
            `;

            studentList.appendChild(row);
        });
    } catch (err) {
        alert("Could not load students.");
        console.error(err);
    }
}

function editStudent(id, name, attendance, percentage) {
    const newName = prompt("Enter new name", name);
    const newAttendance = prompt("Enter attendance (Present/Absent)", attendance || "Present");
    const newPercentage = prompt("Enter attendance %", percentage || "0.00");

    if (!newName || !newAttendance || !newPercentage) {
        return;
    }

    fetch(`${API}/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: newName,
            attendance: newAttendance,
            attendance_percentage: newPercentage
        })
    })
        .then(async (res) => {
            if (!res.ok) {
                throw new Error("Failed to update student");
            }
            await loadStudents();
        })
        .catch((err) => {
            alert("Could not update student.");
            console.error(err);
        });
}

async function deleteStudent(id) {
    try {
        const res = await fetch(`${API}/students/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            throw new Error("Failed to delete student");
        }

        await loadStudents();
    } catch (err) {
        alert("Could not delete student.");
        console.error(err);
    }
}

async function searchStudent() {
    const query = document.getElementById("search").value.toLowerCase();

    try {
        const res = await fetch(`${API}/students`);
        if (!res.ok) {
            throw new Error("Failed to search students");
        }

        const data = await res.json();
        const studentList = document.getElementById("studentList");
        studentList.innerHTML = "";

        const filtered = data.filter((student) =>
            student.name.toLowerCase().includes(query)
        );

        filtered.forEach((student) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.attendance}</td>
                <td>${student.attendance_percentage}%</td>
                <td>
                    <button onclick="editStudent(${student.id}, '${student.name}', '${student.attendance}', '${student.attendance_percentage}')">Edit</button>
                    <button onclick="deleteStudent(${student.id})">Delete</button>
                </td>
            `;

            studentList.appendChild(row);
        });
    } catch (err) {
        alert("Could not search students.");
        console.error(err);
    }
}

function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (user === "admin" && pass === "1234") {
        localStorage.setItem("loggedIn", "true");
        window.location.href = "index.html";
    } else {
        alert("Invalid login");
    }
}

function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}

loadStudents();