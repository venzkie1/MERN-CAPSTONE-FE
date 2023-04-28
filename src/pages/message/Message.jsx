import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Message.scss";
import { useState } from "react";

const Message = () => {
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const queryClient = useQueryClient();

  const [users, setUsers] = useState([]);

  const { isLoading, error, data } = useQuery({
    queryKey: ["messages", "users"],
    queryFn: () =>
      newRequest.get(`/messages/${id}`).then((res) => {
        setUsers(res.data.users);
        return res.data.messages;
      }),
  });

  const mutation = useMutation({
    mutationFn: (message) => {
      return newRequest.post(`/messages`, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["messages", "users"]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      conversationId: id,
      desc: e.target[0].value,
      seenAt: Date.now(),
    });
    e.target[0].value = "";
  };

  console.log('users', users)

  return (
    <div className="message">
      <div className="container">
        <span className="breadcrumbs">
          <Link to="/messages">Messages</Link> {">"} {"<"}
        </span>
        {isLoading ? (
          "loading"
        ) : error ? (
          "error"
        ) : (
          <div className="messages">
            {data.map((m) => (
              <div key={m._id}>
                <div>
                  {users.find(
                    (user) =>
                      user._id === m.userId &&
                      user._id !== currentUser._id
                  )?.username}
                </div>
                <div
                  className={
                    m.userId === currentUser._id ? "owner item" : "item"
                  }
                >
                  <img
                    src={
                      m.userId === currentUser._id
                        ? currentUser.img || "/img/noavatar.jpg"
                        : users.find((user) => user._id === m.userId)?.img ||
                          "/img/noavatar.jpg"
                    }
                  />
                  <p>{m.desc}</p>
                  {m.seenAt && m.userId === currentUser._id &&  (
                    <span className="seen-by">
                      Seen by{" "}
                      {users.find(
                    (user) =>
                      user._id !== currentUser._id
                  )?.username}{" "}
                      at {new Date(m.seenAt).toLocaleString()}
                    </span>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
        <hr />
        <form className="write" onSubmit={handleSubmit}>
          <textarea type="text" placeholder="write a message" />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Message;
