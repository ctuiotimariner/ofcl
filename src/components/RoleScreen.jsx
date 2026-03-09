function RoleScreen({ setRole }) {
  return (
    <div className="roleScreen">
      <div className="roleCard">
        <h1>Welcome to OFCL PRNT</h1>
        <p>Select your role to enter the dashboard</p>

        <div className="roleButtons">
          <button onClick={() => setRole("admin")}>Admin</button>
          <button onClick={() => setRole("employee")}>Employee</button>
        </div>
      </div>
    </div>
  )
}

export default RoleScreen