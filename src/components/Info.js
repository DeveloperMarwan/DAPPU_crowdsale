const Info = ({ account, accountBalance }) => {
    return (
        <div className="my-3">
            <p><strong>Accoount: </strong>{account}</p>
            <p><strong>Tokens Owned: </strong>{accountBalance}</p>
        </div>
    )
}

export default Info;