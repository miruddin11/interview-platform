import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

function EndCallButton() {
  const call = useCall();
  const router = useRouter();
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const updateInterviewStatus = useMutation(api.interviews.updateInterviewStatus);

  const interview = useQuery(api.interviews.getInterviewByStreamCallId, {
    streamCallId: call?.id || "",
  });

  // Log diagnostic information for debugging
  console.log('EndCallButton Debug:', {
    call: !!call,
    interview: !!interview,
    localParticipant: !!localParticipant,
    createdBy: call?.state.createdBy?.id,
    localUserId: localParticipant?.userId
  });

  if (!call || !interview) {
    console.warn('EndCallButton: Missing call or interview information');
    return null;
  }

  const isMeetingOwner = localParticipant?.userId === call.state.createdBy?.id;

  // Optional: Log if user is not meeting owner
  if (!isMeetingOwner) {
    console.log('Current user is not the meeting owner');
    return null;
  }

  const endCall = async () => {
    try {
      await call.endCall();

      await updateInterviewStatus({
        id: interview._id,
        status: "completed",
      });

      router.push("/");
      toast.success("Meeting ended for everyone");
    } catch (error) {
      console.error("Failed to end meeting:", error);
      toast.error(`Failed to end meeting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Button variant={"destructive"} onClick={endCall} className="w-full">
      End Meeting
    </Button>
  );
}
export default EndCallButton;