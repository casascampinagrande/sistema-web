from rest_framework import status, response, views
from .serializers import RegistroCorretorSerializer, AnuncioSerializer
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import User 
from django.shortcuts import redirect
from django.shortcuts import render
from django.contrib.auth import authenticate
from django.contrib.auth.forms import PasswordResetForm
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .models import Anuncio

#===== PÁGINAS (HTML) =====

def home(request):
    return render(request, "index.html")

def login(request):
    return render(request, "login.html")

def registro(request):
    return render(request, "registro.html")

def perfil(request):
    return render(request, "perfil.html")

def suporte(request):
    return render(request, "suporte.html")

def ativacao_sucesso(request):
    return render(request, "ativacao_sucesso.html")

def terms(request):
    return render(request, "terms.html")

def privacy(request):
    return render(request, "privacy.html")

def anunciar(request):
    return render(request, "anunciar.html")

# ===== API =====

class RegistroView(views.APIView):
    def post(self, request):
        serializer = RegistroCorretorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return response.Response({"mensagem": "Corretor cadastrado! Verifique seu e-mail para ativar a conta."}, status=status.HTTP_201_CREATED)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AtivarContaView(views.APIView):
    def get(self, request, uidb64, token): 
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return redirect('ativacao_sucesso')
        else:
            return response.Response({"erro": "Link de ativação inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)
        
class ChecarAtivacaoView(views.APIView):
    def get(self, request):
        email = request.query_params.get('email')
        try:
            user = User.objects.get(email=email)
            return response.Response({"ativo": user.is_active})
        except User.DoesNotExist:
            return response.Response({"error": "Usuário não encontrado"}, status=404)

class LoginView(views.APIView):
    def post(self, request):
        email_digitado = request.data.get('username')
        senha_digitada = request.data.get('password')

        try:
            user_obj = User.objects.get(email=email_digitado)
            user = authenticate(username=user_obj.username, password=senha_digitada)
        except User.DoesNotExist:
            user = None

        if user is not None:
            if user.is_active:
                token, _ = Token.objects.get_or_create(user=user)
                return response.Response({"token": token.key}, status=status.HTTP_200_OK)
            else:
                return response.Response({"erro": "Ative sua conta no e-mail."}, status=status.HTTP_400_BAD_REQUEST)
        
        return response.Response({"erro": "E-mail ou senha incorretos."}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        return Response({"detail": "Método GET não é permitido nesta rota."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
class SolicitarResetSenhaView(views.APIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            # Gerar Token e UID
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Link para a página de nova senha no FRONT-END
            # O link leva para o HTML, passando o token na URL
            link = f"redefinir_senha.html?uid={uid}&token={token}"
            
            send_mail(
                'Recuperação de Senha - Valorize',
                f'Clique no link para criar uma nova senha: {link}',
                'noreply@valorize.com',
                [email],
                fail_silently=False,
            )
            return response.Response({"mensagem": "E-mail de recuperação enviado!"})
        except User.DoesNotExist:
            # Por segurança, não confirmamos se o e-mail existe ou não
            return response.Response({"mensagem": "Se este e-mail estiver cadastrado, você receberá um link."}, status=200)
        
class ConfirmarResetSenhaView(views.APIView):
    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        nova_senha = request.data.get('nova_senha')

        print(f"DEBUG UID RECEBIDO: {uidb64}")

        try:
            # Tenta decodificar o UID
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except Exception as e:
            print(f"Erro na decodificação: {e}")
            # RETORNA UM ERRO EM VEZ DE NADA
            return response.Response({"erro": "Link inválido ou malformado."}, status=status.HTTP_400_BAD_REQUEST)

        if user is not None:
        # Verificação manual para debug
            is_token_valid = default_token_generator.check_token(user, token)
            print(f"DEBUG: O token é válido? {is_token_valid}")
        
        if is_token_valid:
            user.set_password(nova_senha)
            user.save()
            return response.Response({"mensagem": "Senha alterada!"})
        else:
            # Se cair aqui, o token realmente não bate com o estado atual do user
            return response.Response({"erro": "Token inválido para este usuário."}, status=400)
        
class PerfilCorretorView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        anuncios = Anuncio.objects.filter(corretor=user)
        anuncios_data = [{
            "id": a.id,
            "title": a.titulo,
            "price": f"R$ {a.preco}",
            "city": a.cidade,
            # Se não tiver imagem, usamos uma de reserva (placeholder)
            "image": a.imagem_capa.url if a.imagem_capa else "https://via.placeholder.com/300"
        } for a in anuncios]

        return Response({
            "name": user.get_full_name() or user.username,
            "memberSince": user.date_joined.strftime("%m/%Y"),
            "avatar": "https://i.pravatar.cc/150?u=" + user.email,
            "cadastroLevel": 70,
            "location": "Paraíba, Brasil",
            "anuncios": anuncios_data  
        })

class PublicarAnuncioView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Pegando os dados do formulário
        data = request.data
        
        try:
            anuncio = Anuncio.objects.create(
                corretor=request.user,
                titulo=data.get('title'),
                descricao=data.get('description'),
                preco=data.get('price').replace('R$', '').replace('.', '').replace(',', '.').strip(),
                cidade=data.get('city'),
                finalidade=data.get('type').lower(), # 'venda' ou 'aluguel'
                # Por enquanto, campos fixos para simplificar
                area_m2=0, 
                imagem_capa=request.FILES.get('images') # Pega a primeira imagem
            )
            return Response({"mensagem": "Anúncio publicado!"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)