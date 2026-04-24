import { useState } from "react"

function RoleScreen({ onSelectRole }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  function handleLogin() {
    // 🔥 Simple hardcoded users (for now)
    const users = [
      { name: "Lafu", password: "1234", role: "admin" },
      { name: "Joe Baldwin", password: "1234", role: "admin" },
      { name: "Brett", password: "1234", role: "employee" },
    ]

    const foundUser = users.find(
      (u) =>
        u.name.toLowerCase() === username.toLowerCase() &&
        u.password === password
    )

    if (!foundUser) {
      alert("Invalid login")
      return
    }

    // 🔥 send to App.jsx
    onSelectRole(foundUser.role, foundUser.name)
  }

  return (
    <div className="roleScreen">
      <div className="roleCard">
        <img src="/ofcl-prnt.png" className="roleLogo" />

        <h3>Login</h3>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  )
}

export default RoleScreen