function RoleScreen({ onSelectRole }) {
  return (
    <div className="roleScreen">
      <div className="roleCard">
        <h1>Welcome to OFCL PRNT</h1>
        <p>Select your role to enter the dashboard</p>

        <div className="roleButtons">
          <button onClick={() => onSelectRole("admin")}>Admin</button>
          <button onClick={() => onSelectRole("employee")}>Employee</button>
        </div>
      </div>
    </div>
  )
}

export default RoleScreen