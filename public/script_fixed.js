const API = window.location.origin;

async function addStudent() {
    const name = document.getElementById("name").value.trim();

    if (!name) {
        alert("Enter student name");
        return;
    }

    await fetch(`${API}/students`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name })
    });

    document.getElementById("name").value = "";
    loadStudents();
}

async function loadStudents() {
    const res = await fetch(`${API}/students`);
    const data = await res.json();
    const studentList = document.getElementById("studentList");

    studentList.innerHTML = "";

    data.forEach((student) => {
        const div = document.createElement("div");

        div.innerHTML = `
            <p>ID: ${student.id}</p>
            <p>Name: ${student.name}</p>
            <p>Attendance: ${student.attendance || "Not set"}</p>
            <p>Attendance %: ${student.attendance_percentage || "0.00"}</p>
            <button onclick="editStudent(${student.id}, '${student.name}', '${student.attendance || "Present"}', '${student.attendance_percentage || "0.00"}')">Edit</button>
            <button onclick="deleteStudent(${student.id})">Delete</button>
            <hr>
        `;

        studentList.appendChild(div);
    });
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
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: newName,
            attendance: newAttendance,
            attendance_percentage: newPercentage
        })
    }).then(() => loadStudents());
}

async function deleteStudent(id) {
    await fetch(`${API}/students/${id}`, {
        method: "DELETE"
    });

    loadStudents();
}

loadStudents();
