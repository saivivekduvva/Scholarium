from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import Goal, User
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
    Additional cleanup for User specific data if necessary.
    Most data is handled by models.CASCADE in SQL, but this is a safety net.
    """
    logging.info(f"Signal: User {instance.username} is being deleted. Cascading cleanup started.")
