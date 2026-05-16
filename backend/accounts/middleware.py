from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from django.conf import settings


class CookieJWTAuthentication(JWTAuthentication):
    """
    Кастомная аутентификация через JWT токены в cookies.
    """
    
    def authenticate(self, request):
        # Сначала пробуем получить токен из cookies
        access_token = request.COOKIES.get('access_token')
        
        # Если нет в cookies, пробуем из Authorization header
        if not access_token:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                access_token = auth_header[7:]
        
        if access_token:
            try:
                # Валидируем токен
                validated_token = self.get_validated_token(access_token)
                if validated_token:
                    return self.get_user(validated_token), validated_token
            except InvalidToken:
                # Если токен невалидный, удаляем cookies
                if hasattr(request, 'delete_cookies'):
                    request.delete_cookies.append('access_token')
                    request.delete_cookies.append('refresh_token')
        
        return None
