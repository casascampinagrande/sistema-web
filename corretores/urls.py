from django.urls import path
from . import views

urlpatterns = [
    # Páginas Web (HTML)
    path('', views.home, name='home'),
    path('registro/', views.registro, name='registro'),
    path('login/', views.login, name='login'),
    path('perfil/', views.perfil, name='perfil'),
    path('suporte/', views.suporte, name='suporte'),
    path('terms/', views.terms, name='terms'),
    path('privacy/', views.privacy, name='privacy'),
    path('anunciar/', views.anunciar, name='anunciar'),

    # Fluxo de ativação
    path('confirmar/<str:uidb64>/<str:token>/', views.AtivarContaView.as_view(), name='confirmar_email'),
    path('checar-ativacao/', views.ChecarAtivacaoView.as_view(), name='checar_ativacao'),

    # Perfil e anúncios
    path('meu-perfil/', views.PerfilCorretorView.as_view(), name='meu_perfil'),
    path('publicar-anuncio/', views.PublicarAnuncioView.as_view(), name='publicar_anuncio'),

    # Reset de senha
    path('password-reset/', views.SolicitarResetSenhaView.as_view(), name='password_reset'),
    path('password-reset-confirm/', views.ConfirmarResetSenhaView.as_view(), name='password_reset_confirm'),

    # API
  
    path('api/registrar/', views.RegistroView.as_view(), name='api_registrar'),
    path('api/login/', views.LoginView.as_view(), name='api_login'),
]