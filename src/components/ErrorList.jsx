export default function ErrorList({ errors }) {
  const messages = Object.values(errors);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="error-list" role="alert">
      {messages.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}
