import React from "react";
import CommentItem from "./CommentItem";

const CommentList = ({ comments, currentUser, feedbackId, onUpdateComment, onDeleteComment }) => {
  if (!comments || comments.length === 0) {
    return <p className="text-gray-500 mb-3">No comments yet. Be the first to comment!</p>;
  }

  return (
    <div className="space-y-4 mb-4">
      <h4 className="font-medium text-gray-700 mb-2">Comments</h4>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUser={currentUser}
          feedbackId={feedbackId}
          onUpdateComment={onUpdateComment}
          onDeleteComment={onDeleteComment}
        />
      ))}
    </div>
  );
};

export default CommentList;