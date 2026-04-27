import { useState } from "react"

function RoleScreen({ onSelectRole }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [shakeLogin, setShakeLogin] = useState(false)

  

  function handleLogin() {
    setErrorMsg("")
    // 🔥 Simple hardcoded users (for now)
    const users = [
      { name: "Lafu", password: "1234", role: "admin" },
      { name: "Joe", password: "1234", role: "admin" },
      { name: "Brett", password: "1234", role: "employee" },
    ]

    const foundUser = users.find(
      (u) =>
        u.name.toLowerCase() === username.toLowerCase() &&
        u.password === password
    )

   if (!foundUser) {
  playSound("error")
  setErrorMsg("Invalid username or password")
  setPassword("")

  setShakeLogin(false)
  setTimeout(() => {
    setShakeLogin(true)
  }, 10)

  return
}

    // 🔥 send to App.jsx
    playSound("success")
    onSelectRole(foundUser.role, foundUser.name)
  }

    function playSound(type) {
  const sounds = {
    error: "/alert.mp3",
    success: "/success.mp3",
  }

  const audio = new Audio(sounds[type])
  audio.volume = 0.6
  audio.play()
}
    return (
    <div className="roleScreen">
      <div className="roleCard">
        <img src="/ofcl-prnt.png" className="roleLogo" />

        <p style={{ opacity: 0.6, fontSize: "12px", margin: "6px 0 14px" }}>
          staff access
        </p>

       <form
  onSubmit={(e) => {
    e.preventDefault()
    handleLogin()
  }}
>
  <input
  autoFocus
  placeholder="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  className={shakeLogin ? "inputError" : ""}
/>

<input
  placeholder="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className={shakeLogin ? "inputError" : ""}
/>

  <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "10px",
    width: "100%",
  }}
>
  {errorMsg && (
    <div
      style={{
        color: "#ff4d4f",
        marginBottom: "8px",
        fontSize: "12px",
        width: "100%",
        textAlign: "center",
      }}
    >
      {errorMsg}
    </div>
  )}

  <button
    type="submit"
    disabled={!username || !password}
    style={{ minWidth: "120px" }}
  >
    LOGIN
  </button>
</div>
</form>
      </div>
    </div>
  )
}

export default RoleScreen