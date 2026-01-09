import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // This guard now uses the JWT strategy we created
    // passport-jwt will automatically:
    // 1. Extract JWT from Authorization header
    // 2. Verify JWT signature
    // 3. Check expiration
    // 4. Call JwtStrategy.validate()
    // 5. Attach user to request.user
    
    return super.canActivate(context);
  }
}

