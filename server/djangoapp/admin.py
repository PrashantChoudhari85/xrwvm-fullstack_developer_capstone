from django.contrib import admin
from .models import CarMake, CarModel


class CarModelAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "car_make",
        "type",
        "year",
    )  # columns shown in admin list view


# Registering models with their respective admins
admin.site.register(CarMake)
admin.site.register(CarModel, CarModelAdmin)