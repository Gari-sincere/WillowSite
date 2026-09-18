import { type FormEvent, useState } from "react";
import { ConvexProvider, ConvexReactClient, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL);

function Messages() {
  const messages = useQuery(api.messages.list);
  const sendMessage = useMutation(api.messages.send);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendMessage({ author, body });
    setBody("");
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder="Name"
          required
        />
        <input
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Message"
          required
        />
        <button type="submit">Send</button>
      </form>
      <ul>
        {messages === undefined ? (
          <li>Loading…</li>
        ) : (
          messages.map((message) => (
            <li key={message._id}>
              <strong>{message.author}:</strong> {message.body}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default function MessagesApp() {
  return (
    <ConvexProvider client={convex}>
      <Messages />
    </ConvexProvider>
  );
}
