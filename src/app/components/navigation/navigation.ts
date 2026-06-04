import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavigationItem } from '../../core/models/navigation-item.model';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss',
})
export class NavigationComponent {
  navigation: NavigationItem[] = [
    { title: 'Каталог', route: '/catalog' ,children: [
      { title: 'Категории', route: '/categories' },
      { title: 'Товары', route: '/products' },
      { title: 'Склады', route: '/stores' },
      { title: 'Типы цен', route: '/prices' },
    ]},
    { title: 'Заказы', route: '/orders' },
    { title: 'Клиенты', route: '/users' },  
    { title: 'Настройки', route: '/settings' },  
  ];
}
