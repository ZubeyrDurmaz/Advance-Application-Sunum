import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  links = [
    { label: 'Our Collection', route: '/collection' },
    { label: 'Deals', route: '/deals' },
    { label: 'Chronos AI', route: '/chronos-ai' },
    { label: 'About', route: null },
    { label: 'Shipping', route: null },
    { label: 'Privacy', route: null },
  ];
}
