import jwt
import requests
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import Users






class ClerkAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        token = auth_header.split(' ')[1]

        # Fetch CLerk JWKS
        jwks_url = "https://neutral-heron-65.clerk.accounts.dev/.well-known/jwks.json"
        try:
            jwks_client = requests.get(jwks_url).json()
            public_keys = {key['kid']:jwt.algorithms.RSAAlgorithm.from_jwk(key) for key in jwks_client['keys']}
        except:
            raise AuthenticationFailed('Could not retrieve Clerk public keys.')
        try:
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header['kid']
            public_key = public_keys.get(kid)
            if not public_key:
                raise AuthenticationFailed('Invalid Key ID in token')
            
            decoded_token = jwt.decode(
             token,
             public_key,
             algorithms= ["RS256"],
             issuer="https://neutral-heron-65.clerk.accounts.dev"

            )    

            user_id = decoded_token.get('sub')
            if not user_id:
                raise AuthenticationFailed('Token does not contain user ID.')
            try:
                user = Users.objects.get(clerk_id=user_id)
            except Users.DoesNotExist:
                # Optionally, create a new user or handle accordingly
                raise AuthenticationFailed('User not found.')
            return (user, token)
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired.')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token.')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication error: {e}')