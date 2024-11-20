import express, { json } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import jwt from 'jsonwebtoken';

import { 
  loginController, 
  signupController, 
  getPoliciesByAcademicYearController, 
  getPolicyVotesController,
  upvotePolicyController,
  downvotePolicyController,
  addPolicyController
} from './controllers';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  // Assuming you have a way to check if the user is authenticated
  // For example, checking a token in the request headers
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Remove 'Bearer' prefix

  
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      } else {
        req.user = decoded;
        next();
      }
    });
  }else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

app.use(cors());
app.use(json());
app.use(morgan('combined')); // Use morgan for logging all HTTP requests

app.post('/login', loginController);
app.post('/signup', signupController);
app.get('/policies/academic-year', getPoliciesByAcademicYearController);
app.get('/policies/:policyId/votes', getPolicyVotesController);
app.post('/policies/:policyId/upvote', isAuthenticated, upvotePolicyController);
app.post('/policies/:policyId/downvote', isAuthenticated, downvotePolicyController);
app.post('/policies', isAuthenticated, addPolicyController); // Route for addPolicyController

app.listen(3000, () => console.log(`listening to 3000`));