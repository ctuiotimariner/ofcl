function RoleScreen({ onSelectRole }) {
  return (
    <div className="roleScreen">
      <div className="roleCard">
         <img
          src="/ofcl-prnt.png"
          alt="OFCL PRNT"
          className="roleLogo"
        />
        
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