import Notification from '../models/Notification.js';

export const upsertNotification = async ({
  ideaId,
  recipient,
  event,
  title,
  leaderName,
  projectName,
  groupId,
  type,
  status,
  submittedAt,
  read = false
}) => {
  const normalizedIdeaId = ideaId.toString();

  return Notification.findOneAndUpdate(
    { ideaId: normalizedIdeaId, recipient, event },
    {
      $set: {
        title,
        leaderName,
        projectName: projectName || '',
        groupId,
        type,
        status,
        submittedAt,
        read,
        recipient,
        event
      }
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );
};