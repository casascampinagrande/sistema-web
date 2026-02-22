from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Corretor, Anuncio
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

class RegistroCorretorSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    senha = serializers.CharField(write_only=True)

    class Meta:
        model = Corretor
        fields = ['nome', 'email', 'senha', 'creci', 'telefone', 'cpf_cnpj']
        extra_kwargs = {
            'creci': {'required': False, 'allow_blank': True},
            'telefone': {'required': False, 'allow_blank': True}
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este e-mail já está em uso.")
        return value

    def validate_cpf_cnpj(self, value):
        if Corretor.objects.filter(cpf_cnpj=value).exists():
            raise serializers.ValidationError("Este CPF ou CNPJ já está cadastrado.")
        return value

    def create(self, validated_data):
        email = validated_data.pop('email')
        senha = validated_data.pop('senha')
        
        # Cria o usuário INATIVO
        user = User.objects.create_user(
            username=email, 
            email=email, 
            password=senha,
            is_active=False  # Ninguém loga sem confirmar!
        )
        
        corretor = Corretor.objects.create(user=user, **validated_data)
        
        # Gerar Token de Confirmação
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Link que o usuário vai clicar (ajuste para o seu domínio no futuro)
        link = f"http://127.0.0.1:8000/api/confirmar/{uid}/{token}/"
        
        # Enviar o e-mail
        send_mail(
            'Confirme sua conta na Valorize',
            f'Olá {corretor.nome}, clique no link para ativar sua conta: {link}',
            'noreply@valorize.com',
            [email],
            fail_silently=False,
        )
        return corretor
    

class AnuncioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Anuncio
        fields = [
            'id', 'titulo', 'descricao', 'preco', 
            'cidade', 'bairro', 'quartos', 'banheiros', 
            'vagas_garagem', 'area_m2', 'finalidade', 
            'imagem_capa', 'data_criacao'
        ]
        read_only_fields = ['id', 'data_criacao']