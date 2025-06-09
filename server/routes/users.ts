import { Router, Request, Response, RequestHandler } from 'express';
import { storage } from "../storage";

interface AuthUser {
  id: string;
  role: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const router = Router();

router.get("/me/stats", (async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const stats = await storage.getUserSubmissionStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}) as unknown as RequestHandler);

export default router; 