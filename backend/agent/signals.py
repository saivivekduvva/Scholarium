from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import Goal, User, Session

@receiver(pre_delete, sender=Session)
def cleanup_session_data(sender, instance, **kwargs):
    """
    Ensures that MongoDB conversation logs are deleted when a Session is removed.
    """
    try:
        session_id = instance.id
        result = mongo_brain.conversations.delete_many({'session_id': session_id})
        logging.info(f"Signal: Deleted {result.deleted_count} conversation logs for Session ID {session_id} from MongoDB.")
    except Exception as e:
        logging.error(f"Signal: Error cleaning up MongoDB for Session {instance.id}: {str(e)}")

from .mongo_client import mongo_brain
import logging

@receiver(pre_delete, sender=Goal)
def cleanup_goal_data(sender, instance, **kwargs):
    """
    Ensures that when a Goal is deleted (either directly or via User cascade),
    all associated external data (like MongoDB graphs) is also wiped.
    """
    try:
        goal_id = instance.id
        # Delete from MongoDB
        result = mongo_brain.graphs.delete_many({'goal_id': goal_id})
        logging.info(f"Signal: Deleted {result.deleted_count} graphs for Goal ID {goal_id} from MongoDB.")
    except Exception as e:
        logging.error(f"Signal: Error cleaning up MongoDB for Goal {instance.id}: {str(e)}")


@receiver(pre_delete, sender=User)
def cleanup_user_data(sender, instance, **kwargs):
    """
    Final safety check for User data.
    Most is handled by CASCADE, but we log the event.
    """
    logging.info(f"Signal: User {instance.username} (ID: {instance.id}) is being hard-deleted. Username is now available for re-registration.")
